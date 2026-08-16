<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP Login SIPDosir</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
        .header { background-color: #003087; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .content p { margin-top: 0; font-size: 16px; }
        .otp-container { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; color: #003087; letter-spacing: 8px; margin: 0; }
        .warning-box { background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin-bottom: 25px; border-radius: 4px; }
        .warning-box p { margin: 0; color: #991b1b; font-size: 14px; }
        .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SIPDosir</h1>
        </div>
        <div class="content">
            <p>Halo,</p>
            <p>Kami menerima permintaan masuk (login) ke aplikasi <strong>SIPDosir</strong>. Gunakan kode keamanan (OTP) di bawah ini untuk melanjutkan:</p>
            
            <div class="otp-container">
                <p style="font-size: 13px; color: #64748b; margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">Kode OTP Anda</p>
                <p class="otp-code">{{ $otp }}</p>
            </div>

            <div class="warning-box">
                <p><strong>Peringatan Keamanan:</strong> Kode ini hanya berlaku selama <strong>2 menit</strong>. Jangan berikan kode ini kepada siapa pun! Jika Anda salah memasukkan kode sebanyak 2 kali, akun Anda akan diblokir.</p>
            </div>

            <p>Jika Anda tidak merasa mencoba login, Anda dapat mengabaikan email ini. Akun Anda tetap aman.</p>
            
            <p style="margin-top: 40px; margin-bottom: 0;">Salam hangat,</p>
            <p style="font-weight: bold; color: #003087; margin-top: 5px;">Tim SIPDosir</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Sistem Informasi Dosir. Hak Cipta Dilindungi.</p>
            <p>Email ini dikirim secara otomatis, mohon tidak membalas.</p>
        </div>
    </div>
</body>
</html>
