import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
    TrendingUp, CalendarDays, Trophy, Users,
    FileText, CheckCircle2, XCircle, Clock, ArrowUpRight, Medal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Ringkasan {
    hari_ini: number;
    minggu_ini: number;
    bulan_ini: number;
    total: number;
}

interface Statistik {
    total: number;
    menunggu: number;
    dipinjam: number;
    dikembalikan: number;
    ditolak: number;
}

interface PerBulan {
    bulan: number;
    label: string;
    total: number;
    menunggu: number;
    dipinjam: number;
    dikembalikan: number;
    ditolak: number;
}

interface TopCS {
    id: number;
    name: string;
    no_karyawan: string | null;
    peminjaman_count: number;
    dipinjam: number;
    dikembalikan: number;
}

interface Props {
    ringkasan: Ringkasan;
    statistik: Statistik;
    perBulan: PerBulan[];
    topCS: TopCS[];
    year: number;
    yearOptions: number[];
}

// ── Warna Status ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
    menunggu:     '#3b82f6',
    dipinjam:     '#f59e0b',
    dikembalikan: '#10b981',
    ditolak:      '#ef4444',
};

const PIE_COLORS = [
    STATUS_COLORS.menunggu,
    STATUS_COLORS.dipinjam,
    STATUS_COLORS.dikembalikan,
    STATUS_COLORS.ditolak,
];

// ── Custom Tooltip untuk BarChart ─────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border bg-background shadow-lg p-3 text-xs space-y-1.5 min-w-[140px]">
            <p className="font-semibold text-sm">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.fill }} />
                        {p.name}
                    </span>
                    <span className="font-bold">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Custom Tooltip untuk PieChart ─────────────────────────────────────────────

function CustomPieTooltip({ active, payload }: any) {
    if (!active || !payload?.length) return null;
    const { name, value, payload: p } = payload[0];
    const pct = p.percent ? `${(p.percent * 100).toFixed(1)}%` : '';
    return (
        <div className="rounded-lg border bg-background shadow-lg p-3 text-xs">
            <p className="font-semibold">{name}</p>
            <p className="text-muted-foreground">{value} peminjaman ({pct})</p>
        </div>
    );
}

// ── Rank Medal ────────────────────────────────────────────────────────────────

function RankMedal({ rank }: { rank: number }) {
    if (rank === 1) return <Medal className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank}</span>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminLaporanIndex({ ringkasan, statistik, perBulan, topCS, year, yearOptions }: Props) {
    const [selectedYear, setSelectedYear] = useState(String(year));

    const handleYearChange = (val: string) => {
        setSelectedYear(val);
        router.get('/admin/laporan', { year: val }, { preserveState: true, replace: true });
    };

    // Data untuk PieChart distribusi status
    const pieData = [
        { name: 'Menunggu ACC', value: statistik.menunggu,     key: 'menunggu' },
        { name: 'Dipinjam',      value: statistik.dipinjam,     key: 'dipinjam' },
        { name: 'Dikembalikan',  value: statistik.dikembalikan, key: 'dikembalikan' },
        { name: 'Ditolak',       value: statistik.ditolak,      key: 'ditolak' },
    ].filter(d => d.value > 0);

    // Stat cards ringkasan
    const ringkasanCards = [
        {
            label: 'Hari Ini',
            value: ringkasan.hari_ini,
            icon: CalendarDays,
            color: 'text-violet-600',
            bg: 'bg-violet-50 border-violet-200',
            desc: 'Pengajuan hari ini',
        },
        {
            label: 'Minggu Ini',
            value: ringkasan.minggu_ini,
            icon: TrendingUp,
            color: 'text-sky-600',
            bg: 'bg-sky-50 border-sky-200',
            desc: '7 hari terakhir',
        },
        {
            label: 'Bulan Ini',
            value: ringkasan.bulan_ini,
            icon: FileText,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-200',
            desc: new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' }),
        },
        {
            label: 'Total Semua',
            value: ringkasan.total,
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
            desc: 'Sepanjang masa',
        },
    ] as const;

    return (
        <>
            <Head title="Laporan & Analitik" />
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">

                {/* ── Header ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Laporan & Analitik</h1>
                        <p className="text-sm text-muted-foreground">
                            Ringkasan aktivitas peminjaman dosir dan performa Customer Services
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Tahun:</span>
                        <Select value={selectedYear} onValueChange={handleYearChange}>
                            <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* ── Stat Cards Ringkasan ──────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {ringkasanCards.map(({ label, value, icon: Icon, color, bg, desc }) => (
                        <Card key={label} className={`border ${bg} transition-shadow hover:shadow-md`}>
                            <CardContent className="py-4 px-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                                    <div className="p-1.5 rounded-lg bg-white/60">
                                        <Icon className={`h-4 w-4 ${color}`} />
                                    </div>
                                </div>
                                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3" />
                                    {desc}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ── Grafik Batang & Donat ─────────────────────────────── */}
                <div className="grid gap-4 lg:grid-cols-3">

                    {/* Bar Chart — Per Bulan */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        Peminjaman per Bulan
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                        Jumlah pengajuan peminjaman sepanjang tahun {selectedYear}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={perBulan} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip content={<CustomBarTooltip />} />
                                    <Bar dataKey="dipinjam"    name="Dipinjam"     fill={STATUS_COLORS.dipinjam}     radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="dikembalikan" name="Dikembalikan" fill={STATUS_COLORS.dikembalikan} radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="ditolak"     name="Ditolak"      fill={STATUS_COLORS.ditolak}      radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>

                            {/* Legend manual */}
                            <div className="flex flex-wrap gap-3 justify-center mt-2">
                                {[
                                    { label: 'Dipinjam',     color: STATUS_COLORS.dipinjam },
                                    { label: 'Dikembalikan', color: STATUS_COLORS.dikembalikan },
                                    { label: 'Ditolak',      color: STATUS_COLORS.ditolak },
                                ].map(({ label, color }) => (
                                    <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pie Chart — Distribusi Status */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                Distribusi Status
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Komposisi status semua peminjaman
                            </CardDescription>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-4">
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, idx) => (
                                                    <Cell key={entry.key} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomPieTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Legend */}
                                    <div className="space-y-1.5 mt-2">
                                        {[
                                            { label: 'Menunggu ACC', value: statistik.menunggu,     color: STATUS_COLORS.menunggu,     icon: Clock },
                                            { label: 'Dipinjam',      value: statistik.dipinjam,     color: STATUS_COLORS.dipinjam,     icon: FileText },
                                            { label: 'Dikembalikan',  value: statistik.dikembalikan, color: STATUS_COLORS.dikembalikan, icon: CheckCircle2 },
                                            { label: 'Ditolak',       value: statistik.ditolak,      color: STATUS_COLORS.ditolak,      icon: XCircle },
                                        ].map(({ label, value, color, icon: Icon }) => (
                                            <div key={label} className="flex items-center justify-between text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
                                                    <Icon className="h-3 w-3" style={{ color }} />
                                                    {label}
                                                </span>
                                                <span className="font-semibold">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                    <FileText className="h-10 w-10 opacity-20 mb-2" />
                                    <p className="text-sm">Belum ada data</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── Top CS Leaderboard ────────────────────────────────── */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Peringkat Customer Services
                        </CardTitle>
                        <CardDescription className="text-xs">
                            CS dengan jumlah pencatatan peminjaman terbanyak
                        </CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-0 px-0">
                        {topCS.length === 0 ? (
                            <div className="flex flex-col items-center py-12 text-muted-foreground">
                                <Users className="h-10 w-10 opacity-20 mb-2" />
                                <p className="text-sm">Belum ada data CS</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/40">
                                            <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground w-12">#</th>
                                            <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Customer Services</th>
                                            <th className="text-center px-4 py-3 font-medium text-xs text-muted-foreground">Total Catat</th>
                                            <th className="text-center px-4 py-3 font-medium text-xs text-muted-foreground">Dipinjam</th>
                                            <th className="text-center px-4 py-3 font-medium text-xs text-muted-foreground">Dikembalikan</th>
                                            <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Progress</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topCS.map((cs, idx) => {
                                            const pct = cs.peminjaman_count > 0
                                                ? Math.round((cs.dikembalikan / cs.peminjaman_count) * 100)
                                                : 0;
                                            const isTop = idx === 0;
                                            return (
                                                <tr
                                                    key={cs.id}
                                                    className={`border-b transition-colors ${isTop ? 'bg-yellow-50/50 hover:bg-yellow-50' : 'hover:bg-muted/20'}`}
                                                >
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center justify-center">
                                                            <RankMedal rank={idx + 1} />
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isTop ? 'bg-yellow-100 text-yellow-700' : 'bg-primary/10 text-primary'}`}>
                                                                {cs.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">{cs.name}</p>
                                                                <p className="text-xs text-muted-foreground">{cs.no_karyawan ?? '—'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className={`text-xl font-bold ${isTop ? 'text-yellow-600' : 'text-foreground'}`}>
                                                            {cs.peminjaman_count}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-xs font-medium">
                                                            {cs.dipinjam}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-medium">
                                                            {cs.dikembalikan}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4 min-w-[120px]">
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                                <span>Selesai</span>
                                                                <span>{pct}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </>
    );
}

AdminLaporanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '#' },
        { title: 'Laporan & Analitik', href: '/admin/laporan' },
    ],
};
