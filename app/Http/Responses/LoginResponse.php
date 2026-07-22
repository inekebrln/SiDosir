<?php

namespace App\Http\Responses;

use App\Services\EmailOtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = Auth::user();

        if ($user) {
            $remember = $request->boolean('remember');

            Auth::logout();

            $request->session()->put('login.email_otp.user_id', $user->id);
            $request->session()->put('login.email_otp.remember', $remember);

            app(EmailOtpService::class)->generateAndSend($user);

            return redirect('/two-factor-email-challenge');
        }

        return redirect()->intended(config('fortify.home'));
    }
}