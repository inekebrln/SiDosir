<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class KredensialUserMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly string $plainPassword
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Akun SiDosir Anda Telah Dibuat');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.kredensial-user');
    }
}