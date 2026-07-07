<?php

namespace App\Services;

use App\Models\Peminjaman;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class PeminjamanService
{
    /**
     * Catat pengajuan peminjaman baru (oleh CS).
     */
    public function catat(User $user, array $data, ?string $fotoPath = null): Peminjaman
    {
        return Peminjaman::create([
            'user_id' => $user->id,
            'nama_peminjam' => $data['nama_peminjam'],
            'notas_nik' => $data['notas_nik'],
            'nama_dosir' => $data['nama_dosir'],
            'no_dosir' => $data['no_dosir'],
            'foto_bukti' => $fotoPath,
            'status' => 'menunggu',
            'catatan' => $data['catatan'] ?? null,
        ]);
    }

    /**
     * Admin menyetujui peminjaman.
     */
    public function setujui(Peminjaman $peminjaman, array $data): Peminjaman
    {
        $peminjaman->update([
            'status' => 'dipinjam',
            'lokasi_rak' => $data['lokasi_rak'],
            'catatan_admin' => $data['catatan_admin'] ?? null,
            'tgl_pinjam' => now()->toDateString(),
        ]);

        return $peminjaman->fresh();
    }

    /**
     * Admin menolak peminjaman.
     */
    public function tolak(Peminjaman $peminjaman, string $catatanAdmin): Peminjaman
    {
        $peminjaman->update([
            'status' => 'ditolak',
            'catatan_admin' => $catatanAdmin,
        ]);

        return $peminjaman->fresh();
    }

    /**
     * Proses pengembalian.
     */
    public function kembalikan(Peminjaman $peminjaman): Peminjaman
    {
        $peminjaman->update([
            'status' => 'dikembalikan',
            'tgl_kembali' => now()->toDateString(),
        ]);

        return $peminjaman->fresh();
    }

    /**
     * Daftar peminjaman dengan filter & search.
     */
    public function daftar(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Peminjaman::with('user')
            ->when($filters['status'] ?? null, fn($q, $s) => $q->byStatus($s))
            ->when($filters['user_id'] ?? null, fn($q, $uid) => $q->where('user_id', $uid))
            ->search($filters['q'] ?? null)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Statistik peminjaman untuk dashboard.
     */
    public function statistik(): array
    {
        return [
            'total' => Peminjaman::count(),
            'menunggu' => Peminjaman::byStatus('menunggu')->count(),
            'dipinjam' => Peminjaman::byStatus('dipinjam')->count(),
            'dikembalikan' => Peminjaman::byStatus('dikembalikan')->count(),
            'ditolak' => Peminjaman::byStatus('ditolak')->count(),
        ];
    }

    /**
     * Statistik ringkasan: hari ini, minggu ini, bulan ini.
     */
    public function statistikRingkasan(): array
    {
        return [
            'hari_ini' => Peminjaman::whereDate('created_at', today())->count(),
            'minggu_ini' => Peminjaman::whereBetween('created_at', [
                now()->startOfWeek(),
                now()->endOfWeek(),
            ])->count(),
            'bulan_ini' => Peminjaman::whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count(),
            'total' => Peminjaman::count(),
        ];
    }

    /**
     * Statistik peminjaman per bulan dalam satu tahun (untuk grafik batang).
     */
    public function statistikPerBulan(int $year): array
    {
        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'bulan' => $m,
                'label' => Carbon::create($year, $m, 1)->isoFormat('MMM'),
                'total' => Peminjaman::whereYear('created_at', $year)->whereMonth('created_at', $m)->count(),
                'menunggu' => Peminjaman::whereYear('created_at', $year)->whereMonth('created_at', $m)->byStatus('menunggu')->count(),
                'dipinjam' => Peminjaman::whereYear('created_at', $year)->whereMonth('created_at', $m)->byStatus('dipinjam')->count(),
                'dikembalikan' => Peminjaman::whereYear('created_at', $year)->whereMonth('created_at', $m)->byStatus('dikembalikan')->count(),
                'ditolak' => Peminjaman::whereYear('created_at', $year)->whereMonth('created_at', $m)->byStatus('ditolak')->count(),
            ];
        }
        return $months;
    }

    /**
     * Ranking CS berdasarkan jumlah peminjaman yang dicatat.
     */
    public function topCS(int $limit = 5): array
    {
        return User::withCount('peminjaman')
            ->where('role', 'customer_services')
            ->orderByDesc('peminjaman_count')
            ->limit($limit)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'no_karyawan' => $u->no_karyawan,
                'peminjaman_count' => $u->peminjaman_count,
                'dipinjam' => $u->peminjaman()->byStatus('dipinjam')->count(),
                'dikembalikan' => $u->peminjaman()->byStatus('dikembalikan')->count(),
            ])
            ->toArray();
    }
}
