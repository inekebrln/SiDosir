<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\PeminjamanController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\Auth\EmailTwoFactorController;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

// ── Halaman challenge OTP email: HARUS di luar middleware auth,
// karena user belum login penuh saat mengakses ini ──
Route::get('/two-factor-email-challenge', [EmailTwoFactorController::class, 'challenge'])->name('two-factor.email.challenge');
Route::post('/two-factor-email-challenge', [EmailTwoFactorController::class, 'verify'])->name('two-factor.email.verify');
Route::post('/two-factor-email-challenge/resend', [EmailTwoFactorController::class, 'resend'])->name('two-factor.email.resend');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', \App\Http\Controllers\DashboardController::class)->name('dashboard');

    // Ganti metode 2FA — ini WAJIB di dalam auth, karena user yang mengubah preferensi harus sudah login
    Route::post('/settings/two-factor-method', [EmailTwoFactorController::class, 'setMethod'])->name('two-factor.method.set');

    // ── Peminjaman (Customer Services & Admin) ────────
    Route::get('peminjaman', [PeminjamanController::class, 'index'])->name('peminjaman.index');
    Route::get('peminjaman/poll', [PeminjamanController::class, 'poll'])->name('peminjaman.poll');
    Route::post('peminjaman', [PeminjamanController::class, 'store'])->name('peminjaman.store');
    Route::put('peminjaman/{peminjaman}', [PeminjamanController::class, 'update'])->name('peminjaman.update');

    // ── Admin Routes ──────────────────────────────────
    Route::middleware(EnsureAdmin::class)->prefix('admin')->name('admin.')->group(function () {
        Route::get('peminjaman', [Admin\PeminjamanController::class, 'index'])->name('peminjaman.index');
        Route::post('peminjaman/{peminjaman}/setujui', [Admin\PeminjamanController::class, 'setujui'])->name('peminjaman.setujui');
        Route::post('peminjaman/{peminjaman}/tolak', [Admin\PeminjamanController::class, 'tolak'])->name('peminjaman.tolak');
        Route::post('peminjaman/{peminjaman}/kembalikan', [Admin\PeminjamanController::class, 'kembalikan'])->name('peminjaman.kembalikan');

        Route::get('users', [Admin\UserController::class, 'index'])->name('users.index');
        Route::post('users', [Admin\UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [Admin\UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');
        Route::post('users/{user}/toggle-status', [Admin\UserController::class, 'toggleStatus'])->name('users.toggle-status');

        Route::get('laporan', [Admin\LaporanController::class, 'index'])->name('laporan.index');
    });
});

require __DIR__ . '/settings.php';