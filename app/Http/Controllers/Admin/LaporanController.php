<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PeminjamanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanController extends Controller
{
    public function __construct(
        private readonly PeminjamanService $peminjamanService
    ) {}

    /**
     * Halaman laporan & analitik peminjaman.
     */
    public function index(Request $request)
    {
        $year = (int) $request->get('year', now()->year);

        return Inertia::render('admin/laporan/index', [
            'ringkasan'  => $this->peminjamanService->statistikRingkasan(),
            'statistik'  => $this->peminjamanService->statistik(),
            'perBulan'   => $this->peminjamanService->statistikPerBulan($year),
            'topCS'      => $this->peminjamanService->topCS(5),
            'year'       => $year,
            'yearOptions'=> range(now()->year, max(now()->year - 4, 2024)),
        ]);
    }
}
