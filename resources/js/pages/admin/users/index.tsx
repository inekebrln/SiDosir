import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search, Plus, Pencil, Trash2, Users, Shield, ShieldCheck,
    UserCheck, UserX, Eye, EyeOff, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { User, PaginatedData, RoleUser } from '@/types';

interface UserStats {
    total: number;
    admin: number;
    customer_services: number;
    aktif: number;
    nonaktif: number;
}

interface Props {
    users: PaginatedData<User>;
    keyword: string;
    filter: string;
    statistik: UserStats;
}

const roleConfig: Record<RoleUser, { label: string; color: string; icon: React.ReactNode }> = {
    admin:              { label: 'Admin',              color: 'bg-violet-100 text-violet-700 border-violet-200', icon: <ShieldCheck className="h-3 w-3" /> },
    customer_services:  { label: 'Customer Services',  color: 'bg-sky-100 text-sky-700 border-sky-200',         icon: <Shield className="h-3 w-3" /> },
};

const statusConfig = {
    aktif:    { label: 'Aktif',    color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    nonaktif: { label: 'Nonaktif', color: 'bg-gray-100 text-gray-500 border-gray-200' },
};

// ─── User Form Dialog ─────────────────────────────────────────────────────────

function UserFormDialog({
    mode,
    user,
    trigger,
}: {
    mode: 'create' | 'edit';
    user?: User;
    trigger: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name:        user?.name        ?? '',
        email:       user?.email       ?? '',
        password:    '',
        no_karyawan: user?.no_karyawan ?? '',
        role:        user?.role        ?? ('customer_services' as RoleUser),
        no_hp:       user?.no_hp       ?? '',
        status:      (user?.status     ?? 'aktif') as 'aktif' | 'nonaktif',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post('/admin/users', {
                onSuccess: () => { reset(); setOpen(false); },
            });
        } else {
            put(`/admin/users/${user!.id}`, {
                onSuccess: () => setOpen(false),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-[92vw] sm:w-full max-w-lg rounded-2xl p-5 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'create' ? (
                            <><Plus className="h-5 w-5" /> Tambah User Baru</>
                        ) : (
                            <><Pencil className="h-5 w-5" /> Edit User</>
                        )}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        {mode === 'create'
                            ? 'Isi formulir untuk menambahkan pengguna baru ke sistem.'
                            : `Edit data pengguna ${user?.name}`}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name & No Karyawan */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="no_karyawan">No. Karyawan</Label>
                            <Input
                                id="no_karyawan"
                                placeholder="CS-001"
                                value={data.no_karyawan}
                                onChange={(e) => setData('no_karyawan', e.target.value)}
                            />
                            {errors.no_karyawan && <p className="text-xs text-destructive">{errors.no_karyawan}</p>}
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@sipdosir.com"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password">
                            Password {mode === 'create' ? '*' : '(kosongkan jika tidak diubah)'}
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={mode === 'create' ? 'Minimal 8 karakter' : '••••••••'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required={mode === 'create'}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                    </div>

                    {/* Role & No HP */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="role">Role *</Label>
                            <Select value={data.role} onValueChange={(v) => setData('role', v as RoleUser)}>
                                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck className="h-3.5 w-3.5 text-violet-600" /> Admin
                                        </span>
                                    </SelectItem>
                                    <SelectItem value="customer_services">
                                        <span className="flex items-center gap-1.5">
                                            <Shield className="h-3.5 w-3.5 text-sky-600" /> Customer Services
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="no_hp">No. HP</Label>
                            <Input
                                id="no_hp"
                                placeholder="08xxxxxxxxxx"
                                value={data.no_hp}
                                onChange={(e) => setData('no_hp', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-1.5">
                        <Label htmlFor="status_user">Status *</Label>
                        <Select value={data.status} onValueChange={(v) => setData('status', v as 'aktif' | 'nonaktif')}>
                            <SelectTrigger id="status_user"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="aktif">
                                    <span className="flex items-center gap-1.5">
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Aktif
                                    </span>
                                </SelectItem>
                                <SelectItem value="nonaktif">
                                    <span className="flex items-center gap-1.5">
                                        <UserX className="h-3.5 w-3.5 text-gray-500" /> Nonaktif
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : mode === 'create' ? 'Tambah User' : 'Simpan Perubahan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersIndex({ users, keyword, filter, statistik }: Props) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [q, setQ] = useState(keyword);
    const [roleFilter, setRoleFilter] = useState(filter || 'semua');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params: Record<string, string> = {};
        if (q) params.q = q;
        if (roleFilter !== 'semua') params.role = roleFilter;
        router.get('/admin/users', params, { preserveState: true, replace: true });
    };

    const handleFilter = (val: string) => {
        setRoleFilter(val);
        const params: Record<string, string> = {};
        if (q) params.q = q;
        if (val !== 'semua') params.role = val;
        router.get('/admin/users', params, { preserveState: true, replace: true });
    };

    const handleDelete = (user: User) => {
        if (user.id === auth.user.id) {
            alert('Tidak dapat menghapus akun sendiri.');
            return;
        }
        if (confirm(`Hapus user "${user.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
            router.delete(`/admin/users/${user.id}`);
        }
    };

    const handleToggleStatus = (user: User) => {
        const newStatus = user.status === 'aktif' ? 'nonaktifkan' : 'aktifkan';
        if (confirm(`${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} user "${user.name}"?`)) {
            router.post(`/admin/users/${user.id}/toggle-status`);
        }
    };

    const statsItems = [
        { key: 'total',             label: 'Total User',         color: 'text-foreground',    bg: 'bg-muted/50 border-border',       icon: Users },
        { key: 'admin',             label: 'Admin',              color: 'text-violet-600',    bg: 'bg-violet-50 border-violet-200',   icon: ShieldCheck },
        { key: 'customer_services', label: 'Customer Services',  color: 'text-sky-600',       bg: 'bg-sky-50 border-sky-200',         icon: Shield },
        { key: 'aktif',             label: 'Aktif',              color: 'text-emerald-600',   bg: 'bg-emerald-50 border-emerald-200', icon: UserCheck },
    ] as const;

    return (
        <>
            <Head title="Kelola User" />
            <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">

                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kelola User & Role</h1>
                        <p className="text-sm text-muted-foreground">
                            Manajemen pengguna sistem dan pengaturan hak akses
                        </p>
                    </div>
                    <UserFormDialog
                        mode="create"
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-1.5" />
                                Tambah User
                            </Button>
                        }
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statsItems.map(({ key, label, color, bg, icon: Icon }) => (
                        <Card key={key} className={`border ${bg} cursor-pointer hover:shadow-sm transition-shadow`}
                              onClick={() => key !== 'total' && key !== 'aktif' ? handleFilter(key) : handleFilter('semua')}>
                            <CardContent className="flex items-center gap-3 py-4">
                                <Icon className={`h-8 w-8 ${color} opacity-70`} />
                                <div>
                                    <p className="text-xs text-muted-foreground">{label}</p>
                                    <p className={`text-2xl font-bold ${color}`}>{(statistik as any)[key]}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Role Permissions Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <Card className="border-violet-200 bg-violet-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-violet-700">
                                <ShieldCheck className="h-4 w-4" />
                                Admin
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li className="flex items-center gap-1.5">✓ Kelola semua data arsip & lokasi rak</li>
                                <li className="flex items-center gap-1.5">✓ Approve / reject peminjaman</li>
                                <li className="flex items-center gap-1.5">✓ Proses pengembalian dokumen</li>
                                <li className="flex items-center gap-1.5">✓ Manajemen user & role</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-sky-200 bg-sky-50/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2 text-sky-700">
                                <Shield className="h-4 w-4" />
                                Customer Services
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li className="flex items-center gap-1.5">✓ Pencarian arsip / dosir nasabah</li>
                                <li className="flex items-center gap-1.5">✓ Pengajuan peminjaman arsip</li>
                                <li className="flex items-center gap-1.5">✓ Melihat riwayat peminjaman sendiri</li>
                                <li className="flex items-center gap-1.5">✗ <span className="line-through">Tidak bisa mengakses menu admin</span></li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* User Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div>
                                <CardTitle className="text-base">Daftar User</CardTitle>
                                <CardDescription className="text-xs">Total {users.total} pengguna terdaftar</CardDescription>
                            </div>
                            <div className="flex flex-row items-center gap-2 w-full mt-2 sm:mt-0">
                                <Select value={roleFilter} onValueChange={handleFilter}>
                                    <SelectTrigger className="w-32 sm:w-40 h-8 text-xs shrink-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="semua">Semua Role</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="customer_services">Customer Services</SelectItem>
                                    </SelectContent>
                                </Select>
                                <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto flex-1">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            className="pl-8 w-full sm:w-56 h-8 text-xs"
                                            placeholder="Cari nama / email..."
                                            value={q}
                                            onChange={(e) => setQ(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" size="sm" variant="secondary" className="h-8 shrink-0">Cari</Button>
                                </form>
                            </div>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-0 px-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40">
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">User</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">No. Karyawan</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Role</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">No. HP</th>
                                        <th className="text-left px-4 py-3 font-medium text-xs text-muted-foreground">Status</th>
                                        <th className="text-right px-4 py-3 font-medium text-xs text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users className="h-8 w-8 opacity-30" />
                                                    <span>Tidak ada user ditemukan</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => {
                                            const role = roleConfig[user.role];
                                            const status = statusConfig[user.status];
                                            const isSelf = user.id === auth.user.id;

                                            return (
                                                <tr key={user.id} className="border-b hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shrink-0 text-sm font-bold text-primary">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm">
                                                                    {user.name}
                                                                    {isSelf && (
                                                                        <span className="ml-1.5 text-xs text-muted-foreground">(Anda)</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs">{user.no_karyawan ?? '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${role.color}`}>
                                                            {role.icon}
                                                            {role.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-muted-foreground">{user.no_hp ?? '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleToggleStatus(user)}
                                                                disabled={isSelf}
                                                                title={user.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                                                            >
                                                                {user.status === 'aktif'
                                                                    ? <ToggleRight className="h-4 w-4 text-emerald-600" />
                                                                    : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                                                            </Button>
                                                            <UserFormDialog
                                                                mode="edit"
                                                                user={user}
                                                                trigger={
                                                                    <Button variant="ghost" size="sm">
                                                                        <Pencil className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                }
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(user)}
                                                                disabled={isSelf}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {users.last_page > 1 && (
                            <div className="flex justify-center gap-1 py-4">
                                {users.links.map((link, i) => (
                                    <Button key={i} size="sm" variant={link.active ? 'default' : 'outline'}
                                        disabled={!link.url} onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminUsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Admin', href: '#' },
        { title: 'Kelola User', href: '/admin/users' },
    ],
};
