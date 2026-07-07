<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Peminjaman;
use App\Services\PeminjamanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PeminjamanController extends Controller
{
    public function __construct(
        private readonly PeminjamanService $peminjamanService
    ) {}

    /**
     * Halaman monitoring & persetujuan semua peminjaman.
     */
    public function index(Request $request)
    {
        return Inertia::render('admin/peminjaman/index', [
            'peminjaman' => $this->peminjamanService->daftar(
                $request->only('q', 'status'),
                perPage: 10
            ),
            'statistik'  => $this->peminjamanService->statistik(),
            'keyword'    => $request->get('q', ''),
            'filter'     => $request->get('status', ''),
        ]);
    }

    /**
     * Admin menyetujui peminjaman.
     */
    public function setujui(Request $request, Peminjaman $peminjaman)
    {
        if ($peminjaman->status !== 'menunggu') {
            return back()->with('error', 'Status peminjaman bukan menunggu persetujuan.');
        }

        $request->validate([
            'lokasi_rak'    => ['required', 'string', 'max:255'],
            'catatan_admin' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->peminjamanService->setujui($peminjaman, $request->only('lokasi_rak', 'catatan_admin'));

        return back()->with('success', 'Pengajuan peminjaman disetujui, dosir sekarang berstatus dipinjam.');
    }

    /**
     * Admin menolak peminjaman.
     */
    public function tolak(Request $request, Peminjaman $peminjaman)
    {
        if ($peminjaman->status !== 'menunggu') {
            return back()->with('error', 'Status peminjaman bukan menunggu persetujuan.');
        }

        $request->validate([
            'catatan_admin' => ['required', 'string', 'max:1000'],
        ]);

        $this->peminjamanService->tolak($peminjaman, $request->catatan_admin);

        return back()->with('success', 'Pengajuan peminjaman ditolak.');
    }

    /**
     * Admin memproses pengembalian.
     */
    public function kembalikan(Peminjaman $peminjaman)
    {
        if ($peminjaman->status !== 'dipinjam') {
            return back()->with('error', 'Peminjaman tidak dalam status dipinjam.');
        }

        $this->peminjamanService->kembalikan($peminjaman);

        return back()->with('success', 'Dosir berhasil dikembalikan.');
    }
}
