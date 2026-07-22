import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';

export default function Register() {
    return (
        <>
            <Head title="Register" />
            <div className="text-center">
                <p className="text-muted-foreground">
                    Pendaftaran akun hanya dapat dilakukan oleh Admin.
                </p>
                <div className="mt-4">
                    <TextLink href={login()}>Kembali ke halaman login</TextLink>
                </div>
            </div>
        </>
    );
}

Register.layout = {
    title: 'Pendaftaran Tidak Tersedia',
    description: 'Akun hanya dapat dibuat oleh Admin.',
};
