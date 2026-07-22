import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    FileText, ClipboardList, Camera, BarChart3, CheckCircle2,
    ArrowRight, Image, CalendarDays, Users, Clock, ShieldAlert,
    CheckSquare, PlusCircle, UserCheck, Shield, HelpCircle, Activity,
    Calendar, Building, Bell, BellOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/types';

interface PeminjamanItem {
    id: number;
    nama_peminjam: string;
    notas_nik: string;
    nama_dosir: string;
    no_dosir: string;
    foto_bukti: string | null;
    lokasi_rak: string | null;
    catatan_admin: string | null;
    status: 'menunggu' | 'dipinjam' | 'dikembalikan' | 'ditolak';
    tgl_pinjam: string | null;
    tgl_kembali: string | null;
    catatan: string | null;
    created_at: string;
    user?: User;
}

interface Statistik {
    total: number;
    menunggu: number;
    dipinjam: number;
    dikembalikan: number;
    ditolak: number;
}

interface Props {
    statistik: Statistik;
    peminjamanTerbaru?: PeminjamanItem[];
    isAdmin?: boolean;
}

// Helper untuk URL Foto (mendukung ImgBB dan Local Storage)
const getPhotoUrl = (path: string | null) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `/storage/${path}`;
};

export default function Dashboard({ statistik, peminjamanTerbaru = [], isAdmin = false }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    const lastChecked = useRef<string>(new Date().toISOString());
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        // Fetch initial notifications from the last 24 hours on mount
        const sinceTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        fetch(`/peminjaman/poll?since=${encodeURIComponent(sinceTime)}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
            }
        })
            .then((res: Response) => res.json())
            .then((data: { items: any[]; timestamp: string }) => {
                const { items, timestamp } = data;
                if (items && items.length > 0) {
                    setNotifications(items);
                }
                if (timestamp) {
                    lastChecked.current = timestamp;
                }
            })
            .catch((error: Error) => {
                console.error('Error fetching initial notifications:', error);
            });

        // Set up the interval for real-time updates
        const interval = setInterval(() => {
            fetch(`/peminjaman/poll?since=${encodeURIComponent(lastChecked.current)}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            })
                .then((res: Response) => res.json())
                .then((data: { items: any[]; timestamp: string }) => {
                    const { items, timestamp } = data;
                    if (items && items.length > 0) {
                        setNotifications(prev => {
                            const newItems = items.filter(
                                item => !prev.some(p => p.id === item.id && p.notification_type === item.notification_type)
                            );
                            return [...newItems, ...prev];
                        });

                        items.forEach((item: any) => {
                            if (item.notification_type === 'status_changed') {
                                const isApproved = item.status === 'dipinjam';
                                const isRejected = item.status === 'ditolak';

                                if (isApproved) {
                                    toast.success(`Pengajuan Peminjaman Disetujui!`, {
                                        description: `Peminjaman dosir "${item.no_dosir}" (${item.nama_dosir}) telah disetujui. Lokasi Rak: ${item.lokasi_rak || '-'}`,
                                        duration: 10000,
                                    });
                                } else if (isRejected) {
                                    toast.error(`Pengajuan Peminjaman Ditolak!`, {
                                        description: `Peminjaman dosir "${item.no_dosir}" (${item.nama_dosir}) ditolak. Alasan: ${item.catatan_admin || '-'}`,
                                        duration: 10000,
                                    });
                                } else {
                                    const statusLabels = {
                                        menunggu: 'Menunggu ACC',
                                        dipinjam: 'Dipinjam',
                                        dikembalikan: 'Dikembalikan',
                                        ditolak: 'Ditolak'
                                    };
                                    const label = statusLabels[item.status as keyof typeof statusLabels] || item.status;
                                    toast.info(`Status Peminjaman Diperbarui`, {
                                        description: `Peminjaman dosir "${item.no_dosir}" kini berstatus: ${label}`,
                                        duration: 8000,
                                    });
                                }
                            } else {
                                toast.info(`Peminjaman Baru`, {
                                    description: `${item.user?.name || 'User'} meminjam dosir "${item.no_dosir}" (${item.nama_peminjam})`,
                                    duration: 8000,
                                });
                            }
                        });
                    }
                    if (timestamp) {
                        lastChecked.current = timestamp;
                    }
                })
                .catch((error: Error) => {
                    console.error('Error polling peminjaman:', error);
                });
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, []);

    const clearNotifications = () => {
        setNotifications([]);
    };

    // Formatting date
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 19) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <>
            <Head title="Dashboard SiDosir" />
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">

                {/* Taspen Welcome Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#003087] via-[#0042b3] to-[#00205b] p-6 sm:p-8 text-white shadow-lg border border-white/10">
                    {/* Abstract design elements */}
                    <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div className="absolute right-10 bottom-0 -mr-10 -mb-10 h-48 w-48 rounded-full bg-taspen-gold/10 blur-2xl pointer-events-none" />
                    
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-taspen-gold border border-white/5">
                                <Building className="h-3.5 w-3.5" />
                                PT TASPEN (PERSERO)
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                {getGreeting()}, {user.name}!
                            </h1>
                            <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed">
                                Selamat datang di <strong className="text-white">SiDosir</strong> (Sistem Informasi Dosir). Kelola pencatatan dan monitoring dokumen dosir nasabah secara aman, akurat, dan terintegrasi.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex flex-col items-center bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/5 min-w-[100px] text-center">
                                <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Total Dosir</span>
                                <span className="text-xl sm:text-2xl font-black text-taspen-gold">{statistik.total || 0}</span>
                            </div>
                            
                            {isAdmin ? (
                                <Link href="/admin/peminjaman" className="w-full sm:w-auto">
                                    <Button className="w-full bg-taspen-gold hover:bg-taspen-gold/90 text-[#003087] font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-transform duration-200 gap-1.5 px-5 py-5 rounded-xl">
                                        <BarChart3 className="h-4 w-4" />
                                        Mulai Monitoring
                                    </Button>
                                </Link>
                            ) : (
                                <Link href="/peminjaman" className="w-full sm:w-auto">
                                    <Button className="w-full bg-taspen-gold hover:bg-taspen-gold/90 text-[#003087] font-bold shadow-md hover:scale-[1.02] active:scale-95 transition-transform duration-200 gap-1.5 px-5 py-5 rounded-xl">
                                        <Camera className="h-4 w-4" />
                                        Catat Peminjaman
                                    </Button>
                                </Link>
                            )}

                            {/* Notification Bell inside Welcome Hero Section */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="relative rounded-xl h-11 w-11 bg-white hover:bg-white/90 border border-blue-100 text-[#003087] hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer shadow-md shrink-0">
                                        <Bell className="h-5 w-5 fill-[#003087]/10" />
                                        {notifications.length > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-80 p-0" align="end">
                                    <div className="flex items-center justify-between border-b p-3">
                                        <span className="text-sm font-semibold">Notifikasi Baru</span>
                                        {notifications.length > 0 && (
                                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-[#003087] hover:underline cursor-pointer" onClick={clearNotifications}>
                                                Hapus Semua
                                            </Button>
                                        )}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                                <BellOff className="h-8 w-8 opacity-30 mb-2" />
                                                <p className="text-xs font-medium">Tidak ada notifikasi baru</p>
                                            </div>
                                        ) : (
                                            notifications.map((item) => {
                                                if (item.notification_type === 'status_changed') {
                                                    const statusColors = {
                                                        dipinjam: 'text-emerald-600 dark:text-emerald-400 font-bold',
                                                        ditolak: 'text-rose-600 dark:text-rose-400 font-bold',
                                                        dikembalikan: 'text-blue-600 dark:text-blue-400 font-bold',
                                                        menunggu: 'text-yellow-600 dark:text-yellow-400 font-bold'
                                                    };
                                                    const colorClass = statusColors[item.status as keyof typeof statusColors] || 'text-muted-foreground';

                                                    return (
                                                        <div key={`status-${item.id}-${item.updated_at}`} className="border-b p-3 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                                            <p className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                                <span className="h-2 w-2 rounded-full bg-[#003087]" />
                                                                Pembaruan Status
                                                            </p>
                                                            <p className="text-muted-foreground mt-0.5 leading-relaxed">
                                                                Peminjaman dosir <strong>{item.no_dosir}</strong> ({item.nama_dosir}) sekarang <strong className={colorClass}>{item.status.toUpperCase()}</strong>.
                                                                {item.status === 'dipinjam' && item.lokasi_rak && ` Lokasi Rak: ${item.lokasi_rak}`}
                                                                {item.status === 'ditolak' && item.catatan_admin && ` Alasan: ${item.catatan_admin}`}
                                                            </p>
                                                            <span className="text-[10px] text-muted-foreground mt-1 block">
                                                                {new Date(item.updated_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={`new-${item.id}-${item.created_at}`} className="border-b p-3 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
                                                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                            Peminjaman Dosir Baru
                                                        </p>
                                                        <p className="text-muted-foreground mt-0.5 leading-relaxed">
                                                            <strong>{item.user?.name || 'User'}</strong> mengajukan peminjaman dosir <strong>{item.no_dosir}</strong> ({item.nama_peminjam}).
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground mt-1 block">
                                                            {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Grid Statistik Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Card Menunggu */}
                    <Card className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-200">
                        <CardContent className="flex items-center justify-between p-5">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Menunggu ACC</p>
                                <p className="text-3xl font-black text-blue-600">{statistik.menunggu || 0}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
                                <Clock className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Dipinjam */}
                    <Card className="overflow-hidden border-l-4 border-l-amber-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-200">
                        <CardContent className="flex items-center justify-between p-5">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sedang Dipinjam</p>
                                <p className="text-3xl font-black text-amber-600">{statistik.dipinjam || 0}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
                                <FileText className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Dikembalikan */}
                    <Card className="overflow-hidden border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-200">
                        <CardContent className="flex items-center justify-between p-5">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dikembalikan</p>
                                <p className="text-3xl font-black text-emerald-600">{statistik.dikembalikan || 0}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Ditolak */}
                    <Card className="overflow-hidden border-l-4 border-l-rose-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-200">
                        <CardContent className="flex items-center justify-between p-5">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ditolak / Batal</p>
                                <p className="text-3xl font-black text-rose-600">{statistik.ditolak || 0}</p>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50">
                                <ShieldAlert className="h-6 w-6" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Split Section Layout */}
                <div className="grid gap-6 lg:grid-cols-3">
                    
                    {/* Left Column: Peminjaman Terbaru (Col-span-2) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-sm border border-neutral-100 dark:border-neutral-800">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-[#003087]" />
                                        {isAdmin ? 'Peminjaman Terbaru' : 'Aktivitas Pencatatan Saya'}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        {isAdmin ? 'Monitoring riwayat peminjaman dokumen dari seluruh unit CS' : 'Daftar dokumen yang terakhir Anda catat di sistem'}
                                    </CardDescription>
                                </div>
                                <Link href={isAdmin ? '/admin/peminjaman' : '/peminjaman'}>
                                    <Button variant="outline" size="sm" className="text-xs hover:bg-[#003087] hover:text-white transition-colors duration-200 gap-1">
                                        Lihat Semua <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4">
                                {peminjamanTerbaru.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                        <div className="rounded-full bg-neutral-50 dark:bg-neutral-900 p-4">
                                            <ClipboardList className="h-10 w-10 text-muted-foreground/45" />
                                        </div>
                                        <p className="text-sm font-medium text-muted-foreground">Belum ada aktivitas peminjaman</p>
                                        {!isAdmin && (
                                            <Link href="/peminjaman">
                                                <Button size="sm" className="bg-[#003087] hover:bg-[#003087]/90">
                                                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                                                    Catat Sekarang
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {peminjamanTerbaru.map((item) => (
                                            <div 
                                                key={item.id} 
                                                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 hover:border-[#003087]/20 transition-all duration-200"
                                            >
                                                {/* Left Section: Image and Info */}
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    {/* Foto Bukti */}
                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200/50 shadow-inner group-hover:scale-105 transition-transform duration-200">
                                                        {item.foto_bukti ? (
                                                            <img 
                                                                src={getPhotoUrl(item.foto_bukti)} 
                                                                alt={item.nama_peminjam} 
                                                                className="w-full h-full object-cover" 
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Image className="h-5 w-5 text-muted-foreground/30" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Borrower Info */}
                                                    <div className="min-w-0 space-y-0.5">
                                                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 truncate">
                                                            {item.nama_peminjam}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                            <span className="font-semibold text-[#003087]">{item.no_dosir}</span>
                                                            <span>·</span>
                                                            <span className="truncate max-w-[150px]">{item.nama_dosir}</span>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 shrink-0" />
                                                            {formatDate(item.created_at)}
                                                            {isAdmin && item.user && (
                                                                <>
                                                                    <span>·</span>
                                                                    <span className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded font-medium text-neutral-700 dark:text-neutral-300">
                                                                        CS: {item.user.name}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Right Section: Status Badge & Button */}
                                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2.5 sm:pt-0">
                                                    {item.lokasi_rak && (
                                                        <span className="text-xs font-semibold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-2 py-1 rounded-lg">
                                                            Rak: {item.lokasi_rak}
                                                        </span>
                                                    )}

                                                    <Badge 
                                                        className={`font-bold px-2.5 py-0.5 shadow-sm text-xs rounded-full border ${
                                                            item.status === 'menunggu' ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50' :
                                                            item.status === 'dipinjam' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50' :
                                                            item.status === 'ditolak' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50/80 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50'
                                                        }`}
                                                    >
                                                        {item.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Quick Actions & TASPEN Values (Col-span-1) */}
                    <div className="space-y-6">
                        
                        {/* Quick Actions Card */}
                        <Card className="shadow-sm border border-neutral-100 dark:border-neutral-800">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CheckSquare className="h-5 w-5 text-[#003087]" />
                                    Akses Cepat
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pintasan navigasi untuk mengelola fitur
                                </CardDescription>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-4 grid gap-2.5">
                                {/* Admin specific quick actions */}
                                {isAdmin ? (
                                    <>
                                        <Link href="/admin/peminjaman">
                                            <Button variant="outline" className="w-full justify-start text-left font-semibold hover:border-[#003087] hover:text-[#003087] group duration-150 rounded-xl">
                                                <UserCheck className="mr-2 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                                Persetujuan Dosir
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                        <Link href="/peminjaman">
                                            <Button variant="outline" className="w-full justify-start text-left font-semibold hover:border-[#003087] hover:text-[#003087] group duration-150 rounded-xl">
                                                <PlusCircle className="mr-2 h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                                                Catat Peminjaman Baru
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                        <Link href="/admin/laporan">
                                            <Button variant="outline" className="w-full justify-start text-left font-semibold hover:border-[#003087] hover:text-[#003087] group duration-150 rounded-xl">
                                                <BarChart3 className="mr-2 h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
                                                Laporan & Analitik
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                        <Link href="/admin/users">
                                            <Button variant="outline" className="w-full justify-start text-left font-semibold hover:border-[#003087] hover:text-[#003087] group duration-150 rounded-xl">
                                                <Users className="mr-2 h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
                                                Kelola Pengguna
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link href="/peminjaman">
                                            <Button variant="outline" className="w-full justify-start text-left font-semibold hover:border-[#003087] hover:text-[#003087] group duration-150 rounded-xl">
                                                <PlusCircle className="mr-2 h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                                                Catat Peminjaman Baru
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                        <Link href="/peminjaman">
                                            <Button variant="outline" className="w-full justify-start text-left font-semibold hover:border-[#003087] hover:text-[#003087] group duration-150 rounded-xl">
                                                <ClipboardList className="mr-2 h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                                Riwayat & Pencarian
                                                <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Taspen Values / AKHLAK Card
                        <Card className="shadow-sm border border-neutral-100 dark:border-neutral-800 bg-[#003087]/5 dark:bg-[#00205b]/10">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-bold text-[#003087] flex items-center gap-1.5">
                                    <Shield className="h-4 w-4" />
                                    Core Values BUMN
                                </CardTitle>
                            </CardHeader> */}
                            {/* <CardContent className="text-xs space-y-3.5">
                                <p className="text-muted-foreground leading-relaxed">
                                    Sebagai bagian dari insan TASPEN, mari terapkan budaya <strong className="text-neutral-800 dark:text-neutral-200">AKHLAK</strong> dalam mengelola setiap dokumen:
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-bold">
                                    <div className="bg-white dark:bg-neutral-900 border p-2 rounded-lg text-blue-600 shadow-sm">
                                        AMANAH
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 border p-2 rounded-lg text-emerald-600 shadow-sm">
                                        KOMPETEN
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 border p-2 rounded-lg text-amber-600 shadow-sm">
                                        HARMONIS
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 border p-2 rounded-lg text-rose-600 shadow-sm">
                                        LOYAL
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 border p-2 rounded-lg text-teal-600 shadow-sm">
                                        ADAPTIF
                                    </div>
                                    <div className="bg-white dark:bg-neutral-900 border p-2 rounded-lg text-purple-600 shadow-sm">
                                        KOLABORATIF
                                    </div>
                                </div>
                            </CardContent> */}
                        {/* </Card> */}
                    </div>

                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
