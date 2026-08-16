<?php

namespace App\Http\Controllers;

use App\Services\PeminjamanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private readonly PeminjamanService $peminjamanService
    ) {}

    public function __invoke(Request $request)
    {
        $user = $request->user();
        $isAdmin = $user->isAdmin();

        $data = [
            'isAdmin'    => $isAdmin,
            'statistik'  => $this->peminjamanService->statistik($isAdmin ? null : $user->id),
        ];

        if ($isAdmin) {
            $data['peminjamanTerbaru'] = $this->peminjamanService->daftar([], 5);
        } else {
            $data['peminjamanTerbaru'] = $this->peminjamanService->daftar(['user_id' => $user->id], 5);
        }

        return Inertia::render('dashboard', $data);
    }
}
