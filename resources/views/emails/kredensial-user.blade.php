<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
        .container { background: white; max-width: 500px; margin: auto; padding: 30px; border-radius: 8px; }
        .header { background: #1e3a5f; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; margin: -30px -30px 20px; }
        .kredensial { background: #f0f4ff; border: 1px solid #c7d7f5; border-radius: 6px; padding: 16px; margin: 16px 0; }
        .kredensial p { margin: 6px 0; font-size: 14px; }
        .kredensial strong { display: inline-block; width: 100px; color: #555; }
        .footer { font-size: 12px; color: #999; margin-top: 24px; text-align: center; }
        .warning { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 10px 14px; font-size: 13px; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0">SiDosir</h2>
            <p style="margin:4px 0 0; font-size:13px">Sistem Informasi Dosir</p>
        </div>

        <p>Halo, <strong>{{ $user->name }}</strong>!</p>
        <p>Akun SiDosir Anda telah dibuat oleh admin. Berikut kredensial login Anda:</p>

        <div class="kredensial">
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Password:</strong> {{ $plainPassword }}</p>
            @if($user->no_karyawan)
            <p><strong>No. Karyawan:</strong> {{ $user->no_karyawan }}</p>
            @endif
        </div>

        <div class="warning">
            ⚠️ Segera ganti password Anda setelah login pertama kali.
        </div>

        <p style="margin-top:20px">Akses SiDosir di: <a href="{{ config('app.url') }}">{{ config('app.url') }}</a></p>

        <div class="footer">
            Email ini dikirim otomatis oleh sistem SiDosir. Jangan balas email ini.
        </div>
    </div>
</body>
</html>