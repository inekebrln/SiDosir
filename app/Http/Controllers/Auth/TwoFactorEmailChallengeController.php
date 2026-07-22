<?php
// Lokasi file: app/Http/Controllers/Auth/TwoFactorEmailChallengeController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorEmailChallengeController extends Controller
{
    /**
     * Tampilkan halaman input kode OTP.
     * Dipanggil setelah user login dengan password benar,
     * tapi metode 2FA mereka = email.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        // Pastikan ada user yang sedang menunggu verifikasi 2FA
        if (! $request->session()->has('login.email_otp.user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/two-factor-email-challenge');
    }

    /**
     * Verifikasi kode OTP yang diinput user.
     */
    public function store(Request $request, \App\Services\EmailOtpService $otpService): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $userId = $request->session()->get('login.email_otp.user_id');

        if (! $userId) {
            return redirect()->route('login');
        }

        if (! $otpService->verify($userId, $request->code)) {
            return back()->withErrors([
                'code' => 'Kode salah atau sudah kadaluarsa.',
            ]);
        }

        $user = \App\Models\User::findOrFail($userId);

        $remember = $request->session()->pull('login.email_otp.remember', false);
        $request->session()->forget('login.email_otp.user_id');

        Auth::login($user, $remember);

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Generate & kirim ulang kode OTP baru ke email user.
     */
    public function resend(Request $request, \App\Services\EmailOtpService $otpService): RedirectResponse
    {
        $userId = $request->session()->get('login.email_otp.user_id');

        if (! $userId) {
            return redirect()->route('login');
        }

        if (! $otpService->canResend($userId)) {
            return back()->withErrors([
                'code' => 'Tunggu beberapa saat sebelum minta kode baru.',
            ]);
        }

        $user = \App\Models\User::findOrFail($userId);

        $otpService->generateAndSend($user);

        return back();
    }
}