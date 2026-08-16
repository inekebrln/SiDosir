<?php

namespace App\Http\Controllers;

use App\Models\Peminjaman;
use App\Services\PeminjamanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanController extends Controller
{
    public function __construct(
        private readonly PeminjamanService $peminjamanService
    ) {
    }

    /**
     * Halaman form + daftar peminjaman milik CS/Admin.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();
        $filters = array_merge(
            $request->only('q', 'status'),
            $isAdmin ? [] : ['user_id' => $user->id],
        );

        return Inertia::render('peminjaman/index', [
            'peminjaman' => $this->peminjamanService->daftar($filters, perPage: 5),
            'statistik' => $this->peminjamanService->statistik($isAdmin ? null : $user->id),
            'keyword' => $request->get('q', ''),
            'filter' => $request->get('status', ''),
        ]);
    }


    /**
     * Simpan peminjaman baru (dengan foto selfie).
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'nama_peminjam' => ['required', 'string', 'max:255'],
            'notas_nik' => ['required', 'string', 'max:50'],
            'nama_dosir' => ['required', 'string', 'max:255'],
            'no_dosir' => ['required', 'string', 'max:50'],
            'foto_bukti' => ['required', 'string'], // base64 image
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        // Simpan foto ke ImgBB Cloud (dengan fallback local storage)
        $fotoPath = null;
        if ($request->foto_bukti) {
            $imageData = $request->foto_bukti;

            if (str_starts_with($imageData, 'http')) {
                $fotoPath = $imageData;
            } else {
                $base64Data = $imageData;
                if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
                    $base64Data = substr($imageData, strpos($imageData, ',') + 1);
                }

                // Try uploading to ImgBB Cloud
                $response = Http::asForm()->withOptions(['verify' => false])->post('https://api.imgbb.com/1/upload', [
                    'key' => '256db2b8b8289760fe08915cfbe2541d',
                    'image' => $base64Data,
                ]);

                if ($response->successful() && $response->json('data.url')) {
                    $rawUrl = $response->json('data.url');
                    $fotoPath = str_replace('i.ibb.co', 'i.ibb.co.com', $rawUrl);
                } else {
                    // Fallback ke local storage jika ImgBB offline/gagal
                    $extension = 'jpg';
                    $decodedData = base64_decode($base64Data, true);
                    if ($decodedData !== false) {
                        $fileName = 'foto_bukti/' . time() . '_' . uniqid() . '.' . $extension;
                        Storage::disk('public')->put($fileName, $decodedData);
                        $fotoPath = $fileName;
                    }
                }
            }
        }

        $this->peminjamanService->catat(
            user: $request->user(),
            data: $request->only('nama_peminjam', 'notas_nik', 'nama_dosir', 'no_dosir', 'catatan'),
            fotoPath: $fotoPath,
        );

        return back()->with('success', 'Peminjaman berhasil dicatat.');
    }

    /**
     * Polling endpoint untuk mendeteksi peminjaman baru atau pembaruan status peminjaman.
     */
    public function poll(Request $request): JsonResponse
    {
        $since = $request->get('since');

        if (!$since) {
            return response()->json([
                'items' => [],
                'timestamp' => now()->toIso8601String(),
            ]);
        }

        $user = $request->user();
        $sinceTime = \Carbon\Carbon::parse($since)->setTimezone(config('app.timezone'));

        // 1. Peminjaman baru / berstatus 'menunggu' (dikirim ke Admin)
        $newLoans = collect();
        if ($user->isAdmin()) {
            $newLoans = Peminjaman::with('user')
                ->where(function ($query) use ($sinceTime) {
                    $query->where('created_at', '>', $sinceTime)
                          ->orWhere('status', 'menunggu');
                })
                ->get()
                ->map(function ($item) {
                    $item->notification_type = 'created';
                    return $item;
                });
        }

        // 2. Perubahan status peminjaman milik user sendiri (misal: di-ACC atau ditolak)
        $updatedLoans = Peminjaman::with('user')
            ->where('user_id', $user->id)
            ->where('updated_at', '>', $sinceTime)
            ->whereColumn('updated_at', '!=', 'created_at')
            ->get()
            ->map(function ($item) {
                $item->notification_type = 'status_changed';
                return $item;
            });

        // Gabungkan notifikasi dan urutkan berdasarkan waktu pembaruan terbaru
        $items = $newLoans->concat($updatedLoans)->sortByDesc('updated_at')->values();

        \Log::info('Polling API Called:', [
            'user' => $user->name,
            'since' => $since,
            'sinceTime' => $sinceTime->toDateTimeString(),
            'items_count' => $items->count(),
            'items' => $items->toArray()
        ]);

        return response()->json([
            'items' => $items,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Perbarui data peminjaman jika status masih menunggu.
     */
    public function update(Request $request, Peminjaman $peminjaman): RedirectResponse
    {
        if ($peminjaman->status !== 'menunggu') {
            return back()->with('error', 'Peminjaman yang sudah diproses tidak dapat diubah.');
        }

        if (!$request->user()->isAdmin() && $peminjaman->user_id !== $request->user()->id) {
            return back()->with('error', 'Anda tidak memiliki akses untuk mengubah data ini.');
        }

        $request->validate([
            'nama_peminjam' => ['required', 'string', 'max:255'],
            'notas_nik' => ['required', 'string', 'max:50'],
            'nama_dosir' => ['required', 'string', 'max:255'],
            'no_dosir' => ['required', 'string', 'max:50'],
            'foto_bukti' => ['nullable', 'string'], // base64 image (opsional saat edit)
            'catatan' => ['nullable', 'string', 'max:1000'],
        ]);

        $fotoPath = $peminjaman->foto_bukti;
        if ($request->foto_bukti && (str_starts_with($request->foto_bukti, 'data:image') || !str_starts_with($request->foto_bukti, 'http'))) {
            // Hapus foto lama jika ada di local storage
            if ($peminjaman->foto_bukti && !str_starts_with($peminjaman->foto_bukti, 'http')) {
                Storage::disk('public')->delete($peminjaman->foto_bukti);
            }

            $base64Data = $imageData;
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
                $base64Data = substr($imageData, strpos($imageData, ',') + 1);
            }

            // Try uploading to ImgBB Cloud
            $response = Http::asForm()->withOptions(['verify' => false])->post('https://api.imgbb.com/1/upload', [
                'key' => '256db2b8b8289760fe08915cfbe2541d',
                'image' => $base64Data,
            ]);

            if ($response->successful() && $response->json('data.url')) {
                $rawUrl = $response->json('data.url');
                $fotoPath = str_replace('i.ibb.co', 'i.ibb.co.com', $rawUrl);
            } else {
                $extension = 'jpg';
                $decodedData = base64_decode($base64Data, true);
                if ($decodedData !== false) {
                    $fileName = 'foto_bukti/' . time() . '_' . uniqid() . '.' . $extension;
                    Storage::disk('public')->put($fileName, $decodedData);
                    $fotoPath = $fileName;
                }
            }
        }

        $peminjaman->update([
            'nama_peminjam' => $request->nama_peminjam,
            'notas_nik' => $request->notas_nik,
            'nama_dosir' => $request->nama_dosir,
            'no_dosir' => $request->no_dosir,
            'foto_bukti' => $fotoPath,
            'catatan' => $request->catatan,
        ]);

        return back()->with('success', 'Peminjaman berhasil diperbarui.');
    }
}
