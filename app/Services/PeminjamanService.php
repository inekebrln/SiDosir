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
     * Statistik peminjaman untuk dashboard (mendukung filter per user).
     */
    public function statistik(?int $userId = null): array
    {
        $query = Peminjaman::query();
        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return [
            'total' => (clone $query)->count(),
            'menunggu' => (clone $query)->byStatus('menunggu')->count(),
            'dipinjam' => (clone $query)->byStatus('dipinjam')->count(),
            'dikembalikan' => (clone $query)->byStatus('dikembalikan')->count(),
            'ditolak' => (clone $query)->byStatus('ditolak')->count(),
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
        $driverName = Peminjaman::query()->getConnection()->getDriverName();
        $monthExpr = $driverName === 'pgsql'
            ? 'EXTRACT(MONTH FROM created_at)::integer'
            : 'MONTH(created_at)';

        $rawStats = Peminjaman::selectRaw("
                {$monthExpr} as bulan,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'menunggu' THEN 1 ELSE 0 END) as menunggu,
                SUM(CASE WHEN status = 'dipinjam' THEN 1 ELSE 0 END) as dipinjam,
                SUM(CASE WHEN status = 'dikembalikan' THEN 1 ELSE 0 END) as dikembalikan,
                SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak
            ")
            ->whereYear('created_at', $year)
            ->groupByRaw($monthExpr)
            ->get()
            ->keyBy('bulan');

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthData = $rawStats->get($m);
            $months[] = [
                'bulan' => $m,
                'label' => Carbon::create($year, $m, 1)->isoFormat('MMM'),
                'total' => (int) ($monthData->total ?? 0),
                'menunggu' => (int) ($monthData->menunggu ?? 0),
                'dipinjam' => (int) ($monthData->dipinjam ?? 0),
                'dikembalikan' => (int) ($monthData->dikembalikan ?? 0),
                'ditolak' => (int) ($monthData->ditolak ?? 0),
            ];
        }
        return $months;
    }

    /**
     * Ranking CS berdasarkan jumlah peminjaman yang dicatat.
     */
    public function topCS(int $limit = 5): array
    {
        return User::withCount([
                'peminjaman',
                'peminjaman as dipinjam' => fn($q) => $q->byStatus('dipinjam'),
                'peminjaman as dikembalikan' => fn($q) => $q->byStatus('dikembalikan'),
            ])
            ->where('role', 'customer_services')
            ->orderByDesc('peminjaman_count')
            ->limit($limit)
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'no_karyawan' => $u->no_karyawan,
                'peminjaman_count' => $u->peminjaman_count,
                'dipinjam' => $u->dipinjam_count ?? 0,
                'dikembalikan' => $u->dikembalikan_count ?? 0,
            ])
            ->toArray();
    }
}
