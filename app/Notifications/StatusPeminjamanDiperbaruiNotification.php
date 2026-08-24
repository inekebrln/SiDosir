<?php

namespace App\Notifications;

use App\Models\Peminjaman;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StatusPeminjamanDiperbaruiNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Peminjaman $peminjaman,
        public readonly string $status
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

    public function toDatabase(object $notifiable): array
    {
        $statusText = match ($this->status) {
            'dipinjam' => 'disetujui',
            'ditolak' => 'ditolak',
            'dikembalikan' => 'dikembalikan',
            default => $this->status
        };

        return [
            'peminjaman_id' => $this->peminjaman->id,
            'title' => 'Status Peminjaman',
            'message' => "Peminjaman dosir {$this->peminjaman->no_dosir} telah $statusText.",
            'url' => '/dashboard',
        ];
    }
}
