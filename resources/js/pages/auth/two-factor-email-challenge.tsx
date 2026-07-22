// Lokasi file: resources/js/pages/auth/two-factor-email-challenge.tsx
//
// Konvensi ini mengikuti struktur Laravel React starter kit (Fortify + Inertia),
// jadi ditaruh satu folder dengan `two-factor-challenge.tsx` (versi app authenticator)
// yang sudah ada di resources/js/pages/auth/.
//
// Route yang diasumsikan (sesuaikan dengan nama route di routes/auth.php kamu):
//   POST /two-factor-email-challenge        -> verifikasi kode
//   POST /two-factor-email-challenge/resend -> kirim ulang kode

import { useEffect, useRef, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
type EmailChallengeForm = {


    code: string;
};

const RESEND_COOLDOWN_SECONDS = 60;

export default function TwoFactorEmailChallenge() {
    const { data, setData, post, processing, errors, reset } =
        useForm<EmailChallengeForm>({ code: '' });

    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => {
            if (cooldownTimer.current) clearInterval(cooldownTimer.current);
        };
    }, []);

    const startCooldown = () => {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        cooldownTimer.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/two-factor-email-challenge', {
            onError: () => reset('code'),
        });
    };

    const resendCode = () => {
        if (cooldown > 0 || resending) return;
        setResending(true);
        post('/two-factor-email-challenge/resend', {
            preserveScroll: true,
            onFinish: () => setResending(false),
            onSuccess: startCooldown,
        });
    };

    // Auto-submit begitu 6 digit terisi, biar UX-nya cepat
    useEffect(() => {
        if (data.code.length === 6 && !processing) {
            post('/two-factor-email-challenge', {
                onError: () => reset('code'),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.code]);

    return (
        <>
            <Head title="Verifikasi Kode Email" />

            <form onSubmit={submit} className="flex flex-col items-center gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="code" className="sr-only">
                        Kode OTP
                    </Label>
                    <InputOTP
                        maxLength={6}
                        id="code"
                        value={data.code}
                        onChange={(value) => setData('code', value)}
                        disabled={processing}
                        autoFocus
                    >
                        <InputOTPGroup>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <InputOTPSlot key={i} index={i} />
                            ))}
                        </InputOTPGroup>
                    </InputOTP>
                    <InputError message={errors.code} className="text-center" />
                </div>

                <Button type="submit" className="w-full" disabled={processing || data.code.length < 6}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Verifikasi
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Tidak menerima kode?{' '}
                    <button
                        type="button"
                        onClick={resendCode}
                        disabled={cooldown > 0 || resending}
                        className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                    >
                        {resending
                            ? 'Mengirim...'
                            : cooldown > 0
                              ? `Kirim ulang (${cooldown}s)`
                              : 'Kirim ulang kode'}
                    </button>
                </div>
            </form>
        </>
    );
}

TwoFactorEmailChallenge.layout = {
    title: 'Verifikasi Kode Email',
    description: 'Kami sudah mengirim kode 6 digit ke alamat email kamu. Masukkan kode tersebut untuk melanjutkan.',
};