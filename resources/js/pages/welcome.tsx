import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props as any;

    return (
        <>
            <Head title="Sistem Peminjaman Dosir PT Taspen" />

            <div className="min-h-screen bg-[#ffffff] p-4 ">
                <div className="mx-auto max-w-3xl overflow-hidden rounded-[32px] border border-blue-900/40 bg-[#fffff] shadow-2x5">

    
                    <div className="flex items-center justify-between px-8 py-6">

                        <div className="flex items-center gap-3">

                            <img
                                src="/logo-taspen no bg.png"
                                alt="Taspen"
                                className="h-14"
                            />

                            <div>
                                <h2 className="font-bold text-black">
                                    PT. TASPEN (Persero)
                                </h2>

                                <p className="text-xs text-gray-800">
                                    Sistem Peminjaman Dosir
                                </p>
                            </div>

                        </div>

                        
                    </div>

                   <section className="relative px-8 py-20">

    {/* Background Blur */}
    <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
    <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-yellow-500/10 blur-3xl"></div>

    <div className="relative z-10 flex items-center justify-between">

        {/* ===================== */}
        {/* SECTION LOGO */}
        {/* ===================== */}
        <div className="w-1/2 flex justify-center">
            <img
                src="/LOGO DOSIR.png"
                alt="Logo Dosir"
                className="w-80 h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
        </div>

        {/* ===================== */}
        {/* SECTION TEKS */}
        {/* ===================== */}
        <div className="w-1/2">

            <h1 className="font-poppins text-5xl font-semibold text-black">
                SiDosir
            </h1>

            <p className="mt-5 text-lg text-gray-500 leading-relaxed">
                Mempermudah pengelolaan dokumen dosir melalui sistem
                peminjaman digital yang efisien, transparan, dan terpercaya.
            </p>

            <div className="mt-10">
                {!auth?.user ? (
                    <Link
                        href={login()}
                        className="inline-block rounded-3xl bg-[#003087] px-10 py-4 font-semibold text-white transition hover:scale-105"
                    >
                        Login
                    </Link>
                ) : (
                    <Link
                        href={dashboard()}
                        className="inline-block rounded-3xl bg-[#003087] px-10 py-4 font-semibold text-white transition hover:scale-105"
                    >
                        Dashboard
                    </Link>
                )}
            </div>

        </div>

    </div>

</section>

                    <div className="border-t border-blue-900/30 py-8 text-center text-gray-500">
                        © {new Date().getFullYear()} PT Taspen (Persero) -
                        Sistem Peminjaman Dokumen Dosir
                    </div>

                </div>
            </div>
        </>
    );
}