<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\PeminjamanController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', \App\Http\Controllers\DashboardController::class)->name('dashboard');

    // ── Peminjaman (Customer Services & Admin) ────────
    Route::get('peminjaman', [PeminjamanController::class, 'index'])->name('peminjaman.index');
    Route::get('peminjaman/poll', [PeminjamanController::class, 'poll'])->name('peminjaman.poll');
    Route::post('peminjaman', [PeminjamanController::class, 'store'])->name('peminjaman.store');
    Route::put('peminjaman/{peminjaman}', [PeminjamanController::class, 'update'])->name('peminjaman.update');

    // ── Admin Routes ──────────────────────────────────
    Route::middleware(EnsureAdmin::class)->prefix('admin')->name('admin.')->group(function () {

        // Monitoring Peminjaman
        Route::get('peminjaman', [Admin\PeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::post('peminjaman/{peminjaman}/setujui', [Admin\PeminjamanController::class, 'setujui'])->name('peminjaman.setujui');
        Route::post('peminjaman/{peminjaman}/tolak', [Admin\PeminjamanController::class, 'tolak'])->name('peminjaman.tolak');
        Route::post('peminjaman/{peminjaman}/kembalikan', [Admin\PeminjamanController::class, 'kembalikan'])->name('peminjaman.kembalikan');

        // Kelola User & Role
        Route::get('users', [Admin\UserController::class, 'index'])->name('users.index');
        Route::post('users', [Admin\UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [Admin\UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/toggle-status', [Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');

        // Laporan & Analitik
        Route::get('laporan', [Admin\LaporanController::class, 'index'])->name('laporan.index');
    });
});

require __DIR__ . '/settings.php';
