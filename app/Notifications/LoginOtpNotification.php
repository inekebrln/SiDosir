<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LoginOtpNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $code)
    {
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode Verifikasi Login SiDosir')
            ->greeting('Halo ' . $notifiable->name . ',')
            ->line('Kode verifikasi login Anda adalah:')
            ->line('## ' . $this->code)
            ->line('Kode ini berlaku selama 5 menit.')
            ->line('Jika Anda tidak melakukan percobaan login, abaikan email ini dan segera hubungi administrator.');
    }
}