import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search, FileText, CheckCircle2, XCircle, RotateCcw,
    Camera, BarChart3, Image, CalendarDays, Clock, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { PaginatedData, User as UserType } from '@/types';

interface PeminjamanItem {
    id: number;
    user_id: number;
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
    user?: UserType;
}

interface StatistikPeminjaman {
    total: number;
    menunggu: number;
    dipinjam: number;
    dikembalikan: number;
    ditolak: number;
}

interface Props {
    peminjaman: PaginatedData<PeminjamanItem>;
    statistik: StatistikPeminjaman;
    keyword: string;
    filter: string;
}

// ─── Dialog Bukti Foto & Detail ──────────────────────────────────────────
function PhotoDialog({ item, open, onClose }: { item: PeminjamanItem; open: boolean; onClose: () => void }) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-base">Bukti Face ID & Detail</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    {item.foto_bukti ? (
                        <img src={`/storage/${item.foto_bukti}`} alt="Selfie" className="w-full rounded-lg" />
                    ) : (
                        <div className="flex items-center justify-center py-12 bg-muted rounded-lg">
                            <Image className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                    )}
                    <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-sm">
                        <p><span className="text-muted-foreground">Peminjam:</span> <strong>{item.nama_peminjam}</strong> ({item.notas_nik})</p>
                        <p><span className="text-muted-foreground">Dosir:</span> {item.no_dosir} — {item.nama_dosir}</p>
                        <p><span className="text-muted-foreground">Status:</span> <span className="font-medium uppercase">{item.status}</span></p>
                        {item.tgl_pinjam && <p><span className="text-muted-foreground">Tgl. Pinjam:</span> {new Date(item.tgl_pinjam).toLocaleDateString('id-ID')}</p>}
                        {item.lokasi_rak && <p><span className="text-muted-foreground">Lokasi Rak:</span> {item.lokasi_rak}</p>}
                        {item.catatan_admin && <p><span className="text-muted-foreground">Catatan Admin:</span> {item.catatan_admin}</p>}
                        <Separator className="my-2" />
                        <p><span className="text-muted-foreground">Dicatat oleh CS:</span> {item.user?.name}</p>
                        {item.catatan && <p><span className="text-muted-foreground">Catatan CS:</span> {item.catatan}</p>}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Dialog Persetujuan (ACC) ─────────────────────────────────────────────
function AccDialog({ item, open, onClose }: { item: PeminjamanItem | null; open: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        lokasi_rak: '',
        catatan_admin: '',
    });

    if (!item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/peminjaman/${item.id}/setujui`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-base">Persetujuan Peminjaman</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm mb-4">
                            Persetujuan dosir <strong>{item.no_dosir}</strong> atas nama <strong>{item.nama_peminjam}</strong>.
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="lokasi_rak" className="text-sm flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> Lokasi Rak Dosir *
                            </Label>
                            <Input
                                id="lokasi_rak"
                                placeholder="Cth: Rak A, Baris 2, Laci 3"
                                value={data.lokasi_rak}
                                onChange={(e) => setData('lokasi_rak', e.target.value)}
                                required
                            />
                            {errors.lokasi_rak && <p className="text-xs text-destructive">{errors.lokasi_rak}</p>}
                            <p className="text-xs text-muted-foreground">Informasikan lokasi rak agar CS mudah mencari dosir.</p>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="catatan_admin" className="text-sm">Catatan Admin (Opsional)</Label>
                            <Textarea
                                id="catatan_admin"
                                placeholder="Tambahkan catatan khusus..."
                                rows={3}
                                value={data.catatan_admin}
                                onChange={(e) => setData('catatan_admin', e.target.value)}
                            />
                            {errors.catatan_admin && <p className="text-xs text-destructive">{errors.catatan_admin}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing}>Setujui Peminjaman</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Dialog Penolakan ─────────────────────────────────────────────────────
function RejectDialog({ item, open, onClose }: { item: PeminjamanItem | null; open: boolean; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        catatan_admin: '',
    });

    if (!item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/peminjaman/${item.id}/tolak`, {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-base text-destructive">Tolak Peminjaman</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="catatan_tolak" className="text-sm">Alasan Penolakan *</Label>
                            <Textarea
                                id="catatan_tolak"
                                placeholder="Wajib mengisi alasan penolakan..."
                                rows={3}
                                value={data.catatan_admin}
                                onChange={(e) => setData('catatan_admin', e.target.value)}
                                required
                            />
                            {errors.catatan_admin && <p className="text-xs text-destructive">{errors.catatan_admin}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>Batal</Button>
                        <Button type="submit" variant="destructive" disabled={processing}>Tolak</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Dialog Pengembalian (Confirm Return Modal) ───────────────────────────
function ReturnDialog({ item, open, onClose }: { item: PeminjamanItem | null; open: boolean; onClose: () => void }) {
    const [processing, setProcessing] = useState(false);

    if (!item) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post(`/admin/peminjaman/${item.id}/kembalikan`, {}, {
            onSuccess: () => {
                setProcessing(false);
                onClose();
            },
            onError: () => {
                setProcessing(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) onClose(); }}>
            <DialogContent className="max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-base">Konfirmasi Pengembalian Dosir</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Apakah Anda yakin dosir dengan nomor <strong>{item.no_dosir}</strong> atas nama <strong>{item.nama_peminjam}</strong> telah dikembalikan?
                        </p>
                        <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border border-border">
                            Tindakan ini akan memperbarui status peminjaman menjadi <strong>DIKEMBALIKAN</strong> dan mencatat tanggal pengembalian hari ini.
                        </p>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>Batal</Button>
                        <Button type="submit" disabled={processing} className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                            {processing ? 'Memproses...' : 'Ya, Sudah Dikembalikan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function AdminPeminjamanIndex({ peminjaman, statistik, keyword, filter }: Props) {
    const [q, setQ] = useState(keyword);
    const [statusFilter, setStatusFilter] = useState(filter || 'semua');
    
    const [photoItem, setPhotoItem] = useState<PeminjamanItem | null>(null);
    const [accItem, setAccItem] = useState<PeminjamanItem | null>(null);
    const [rejectItem, setRejectItem] = useState<PeminjamanItem | null>(null);
    const [returnItem, setReturnItem] = useState<PeminjamanItem | null>(null);

    const applyFilters = (newQ?: string, newStatus?: string) => {
        const params: Record<string, string> = {};
        const finalQ = newQ ?? q;
        const finalStatus = newStatus ?? statusFilter;
        if (finalQ) params.q = finalQ;
        if (finalStatus !== 'semua') params.status = finalStatus;
        router.get('/admin/peminjaman', params, { preserveState: true, replace: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'menunggu': return <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 px-2 py-0.5 text-xs font-medium border border-blue-200">Menunggu ACC</span>;
            case 'dipinjam': return <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium border border-amber-200">Dipinjam</span>;
            case 'dikembalikan': return <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium border border-emerald-200">Dikembalikan</span>;
            case 'ditolak': return <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium border border-red-200">Ditolak</span>;
            default: return null;
        }
    };

    const statsItems = [
        { label: 'Menunggu ACC',  value: statistik.menunggu,     color: 'text-blue-600',    bg: 'bg-blue-50 border-blue-200',          icon: Clock },
        { label: 'Dipinjam',      value: statistik.dipinjam,     color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-200',        icon: FileText },
        { label: 'Dikembalikan',  value: statistik.dikembalikan, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200',    icon: CheckCircle2 },
    ] as const;

    return (
        <>
            <Head title="Monitoring & Persetujuan Peminjaman" />
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Monitoring & Persetujuan</h1>
                    <p className="text-sm text-muted-foreground">
                        Persetujuan dan pantauan peminjaman dosir/arsip dari Customer Services
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {statsItems.map(({ label, value, color, bg, icon: Icon }) => (
                        <Card key={label} className={`border ${bg}`}>
                            <CardContent className="flex items-center gap-4 py-4">
                                <div className={`p-2 rounded-full bg-white/50`}>
                                    <Icon className={`h-6 w-6 ${color}`} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <CardTitle className="text-base">Daftar Peminjaman</CardTitle>
                                <CardDescription className="text-xs">Total {peminjaman.total} catatan</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); applyFilters(undefined, val); }}>
                                    <SelectTrigger className="w-36 h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Status</SelectItem>
                                        <SelectItem value="menunggu">Menunggu ACC</SelectItem>
                                        <SelectItem value="dipinjam">Dipinjam</SelectItem>
                                        <SelectItem value="dikembalikan">Dikembalikan</SelectItem>
                                        <SelectItem value="ditolak">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-8 w-56 h-8 text-xs"
                                            placeholder="Cari nama / no dosir..."
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" size="sm" variant="secondary" className="h-8">Cari</Button>
                                </form>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-0 px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 whitespace-nowrap">
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Foto</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Peminjam</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Dosir</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Status</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Lokasi Rak</th>
                                        <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {peminjaman.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                                <div className="flex flex-col items-center gap-2">
                                                    <FileText className="h-8 w-8 opacity-30" />
                                                    <span>Tidak ada data peminjaman</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        peminjaman.data.map((item) => (
                                            <tr key={item.id} className="border-b hover:bg-muted/20 transition-colors">
                                                {/* Foto */}
                                                <td className="px-4 py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPhotoItem(item)}
                                                        className="w-10 h-10 rounded-lg overflow-hidden bg-muted hover:ring-2 ring-primary transition-all cursor-pointer shrink-0"
                                                    >
                                                        {item.foto_bukti ? (
                                                            <img src={`/storage/${item.foto_bukti}`} alt="Selfie" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Camera className="h-4 w-4 text-muted-foreground/40" />
                                                            </div>
                                                        )}
                                                    </button>
                                                </td>
                                                {/* Peminjam */}
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-sm whitespace-nowrap">{item.nama_peminjam}</p>
                                                    <p className="text-xs text-muted-foreground whitespace-nowrap">NIK: {item.notas_nik}</p>
                                                </td>
                                                {/* Dosir */}
                                                <td className="px-4 py-3">
                                                    <p className="font-mono text-xs font-medium whitespace-nowrap">{item.no_dosir}</p>
                                                    <p className="text-xs text-muted-foreground whitespace-nowrap">{item.nama_dosir}</p>
                                                </td>
                                                {/* Status */}
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-start gap-1">
                                                        {getStatusBadge(item.status)}
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* Lokasi Rak */}
                                                <td className="px-4 py-3 text-xs">
                                                    {item.lokasi_rak ? (
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            {item.lokasi_rak}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                {/* Aksi */}
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {item.status === 'menunggu' && (
                                                            <>
                                                                <Button size="sm" variant="outline" className="text-xs h-7 text-destructive hover:text-destructive" onClick={() => setRejectItem(item)}>
                                                                    <XCircle className="h-3 w-3 mr-1" /> Tolak
                                                                </Button>
                                                                <Button size="sm" className="text-xs h-7 bg-blue-600 hover:bg-blue-700" onClick={() => setAccItem(item)}>
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> ACC
                                                                </Button>
                                                            </>
                                                        )}
                                                        {item.status === 'dipinjam' && (
                                                            <Button size="sm" variant="outline" className="text-xs h-7 cursor-pointer" onClick={() => setReturnItem(item)}>
                                                                <RotateCcw className="h-3 w-3 mr-1" /> Kembalikan
                                                            </Button>
                                                        )}
                                                        {item.status === 'dikembalikan' && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" /> Dikembalikan
                                                            </span>
                                                        )}
                                                        {item.status === 'ditolak' && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <XCircle className="h-3 w-3" /> Ditolak
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {peminjaman.last_page > 1 && (
                            <div className="flex justify-center gap-1 py-4">
                                {peminjaman.links.map((link, i) => (
                                    <Button key={i} size="sm" variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {photoItem && <PhotoDialog item={photoItem} open={true} onClose={() => setPhotoItem(null)} />}
            <AccDialog item={accItem} open={!!accItem} onClose={() => setAccItem(null)} />
            <RejectDialog item={rejectItem} open={!!rejectItem} onClose={() => setRejectItem(null)} />
            <ReturnDialog item={returnItem} open={!!returnItem} onClose={() => setReturnItem(null)} />
        </>
    );
}

AdminPeminjamanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '#' },
        { title: 'Monitoring & Persetujuan', href: '/admin/peminjaman' },
    ],
};
