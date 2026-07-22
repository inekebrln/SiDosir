<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorEmailCode extends Notification
{
    use Queueable;

    public function __construct(private int $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode Verifikasi Login - SiDosir')
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Gunakan kode berikut untuk melanjutkan login:')
            ->line('**' . $this->code . '**')
            ->line('Kode ini berlaku selama **10 menit**.')
            ->line('Jika kamu tidak merasa melakukan login, abaikan email ini.')
            ->salutation('Salam, Tim SiDosir PT Taspen');
    }
}