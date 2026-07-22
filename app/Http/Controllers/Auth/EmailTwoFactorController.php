<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmailOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EmailTwoFactorController extends Controller
{
    public function __construct(private EmailOtpService $otp)
    {
    }

    public function challenge(Request $request): Response|RedirectResponse
    {
        $userId = $request->session()->get('login.email_otp.user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($userId);

        return Inertia::render('auth/two-factor-email-challenge', [
            'maskedEmail' => $this->maskEmail($user->email),
        ]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate(['code' => 'required|digits:6']);

        $userId = $request->session()->get('login.email_otp.user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($userId);

        if (!$this->otp->verify($userId, $request->code)) {
            $user->increment('otp_failed_attempts');

            if ($user->otp_failed_attempts >= 2) {
                $user->update([
                    'is_active' => false,
                    'status' => 'nonaktif'
                ]);
                $request->session()->forget('login.email_otp.user_id');
                return redirect()->route('login')->withErrors(['email' => 'Akun Anda diblokir karena terlalu banyak salah memasukkan OTP. Silakan hubungi Admin.']);
            }

            return back()->withErrors(['code' => 'Kode OTP salah atau sudah kedaluwarsa. (Percobaan salah: ' . $user->otp_failed_attempts . '/2)']);
        }

        $user->update(['otp_failed_attempts' => 0]);

        $remember = $request->session()->pull('login.email_otp.remember', false);
        $request->session()->forget('login.email_otp.user_id');

        Auth::loginUsingId($userId, $remember);
        $request->session()->regenerate();

        // Pass success session for SweetAlert
        return redirect()->intended(route('dashboard', absolute: false))->with('success', 'Berhasil Login');
    }

    public function resend(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('login.email_otp.user_id');

        if (!$userId) {
            return redirect()->route('login');
        }

        if (!$this->otp->canResend($userId)) {
            return back()->withErrors(['code' => 'Tunggu sebentar sebelum meminta kode baru.']);
        }

        $this->otp->generateAndSend(User::findOrFail($userId));

        return back()->with('status', 'Kode baru telah dikirim ke email Anda.');
    }

    public function setMethod(Request $request): RedirectResponse
    {
        $request->validate(['method' => 'required|in:app,email']);

        $request->user()->update(['two_factor_method' => $request->method]);

        return back()->with('status', 'Metode 2FA berhasil diperbarui.');
    }

    private function maskEmail(string $email): string
    {
        [$name, $domain] = explode('@', $email);
        $visible = substr($name, 0, 2);

        return $visible . str_repeat('*', max(strlen($name) - 2, 3)) . '@' . $domain;
    }
}