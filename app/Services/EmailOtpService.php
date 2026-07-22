<?php

namespace App\Services;

use App\Models\User;
use App\Notifications\LoginOtpNotification;
use Illuminate\Support\Facades\Cache;

class EmailOtpService
{
    public function generateAndSend(User $user): void
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        Cache::put($this->codeKey($user->id), $code, now()->addMinutes(2));
        Cache::put($this->cooldownKey($user->id), true, now()->addSeconds(60));

        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\LoginOtpMail($code));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Gagal mengirim email OTP ke {$user->email}. Kode OTP: {$code} (Error: {$e->getMessage()})");
        }
    }

    public function verify(int $userId, string $code): bool
    {
        $stored = Cache::get($this->codeKey($userId));

        if (!$stored || !hash_equals($stored, $code)) {
            return false;
        }

        Cache::forget($this->codeKey($userId));

        return true;
    }

    public function canResend(int $userId): bool
    {
        return !Cache::has($this->cooldownKey($userId));
    }

    private function codeKey(int $userId): string
    {
        return "email_otp:{$userId}";
    }

    private function cooldownKey(int $userId): string
    {
        return "email_otp:cooldown:{$userId}";
    }
}