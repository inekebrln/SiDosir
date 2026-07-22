import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { props } = usePage<any>();

    useEffect(() => {
        if (props.flash?.success) {
            if (props.flash.success === 'Berhasil Login') {
                // @ts-ignore
                if (typeof window.Swal !== 'undefined') {
                    // @ts-ignore
                    window.Swal.fire({
                        icon: 'success',
                        title: 'Login Berhasil!',
                        text: 'Selamat datang kembali di SiDosir.',
                    });
                }
            } else {
                toast.success(props.flash.success);
            }
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
        if (props.errors && Object.keys(props.errors).length > 0) {
            const firstError = Object.values(props.errors)[0] as string;
            toast.error(firstError);
        }
    }, [props.flash, props.errors]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
            <Toaster position="top-right" />
        </AppLayoutTemplate>
    );
}
