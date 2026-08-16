<?php

namespace App\Notifications;

use App\Models\Peminjaman;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PeminjamanBaruNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public readonly Peminjaman $peminjaman
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'peminjaman_id' => $this->peminjaman->id,
            'title' => 'Peminjaman Baru',
            'message' => "{$this->peminjaman->nama_peminjam} mengajukan peminjaman dosir {$this->peminjaman->no_dosir}.",
            'url' => '/admin/peminjaman',
        ];
    }
}
