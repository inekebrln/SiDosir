use App\Http\Controllers\Auth\EmailTwoFactorController;

Route::middleware('guest')->group(function () {
    Route::get('two-factor-email-challenge', [EmailTwoFactorController::class, 'challenge'])
        ->name('two-factor-email-challenge.create');

    Route::post('two-factor-email-challenge', [EmailTwoFactorController::class, 'verify'])
        ->name('two-factor-email-challenge.store');

    Route::post('two-factor-email-challenge/resend', [EmailTwoFactorController::class, 'resend'])
        ->name('two-factor-email-challenge.resend');
});