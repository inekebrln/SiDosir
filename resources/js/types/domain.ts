// ─── Enums / Literal Types ───────────────────────────────────────────────────
import type { User } from './auth';

export type RoleUser = 'admin' | 'customer_services';
export type StatusUser = 'aktif' | 'nonaktif';

export type StatusArsip = 'tersedia' | 'dipinjam' | 'dalam_proses' | 'hilang' | 'arsip_lama';

export type StatusPeminjaman = 'menunggu' | 'disetujui' | 'ditolak' | 'dipinjam' | 'dikembalikan';

export type KondisiDokumen = 'baik' | 'rusak_ringan' | 'rusak_berat' | 'hilang';

export type StatusLokasi = 'aktif' | 'nonaktif';

// ─── Models ──────────────────────────────────────────────────────────────────

export interface LokasiRak {
    id: number;
    kode_lokasi: string;
    nama_lokasi: string;
    keterangan: string | null;
    status: StatusLokasi;
    arsip_count?: number;
    created_at: string;
}

export interface Arsip {
    id: number;
    no_dosir: string;
    nama_nasabah: string;
    nip_nasabah: string | null;
    jenis_dokumen: string | null;
    lokasi_rak_id: number | null;
    status_arsip: StatusArsip;
    keterangan: string | null;
    created_at: string;
    // Relations
    lokasi_rak?: LokasiRak;
    peminjaman?: Peminjaman[];
    peminjaman_aktif?: Peminjaman;
    riwayat?: RiwayatArsip[];
    // Accessor
    tersedia?: boolean;
}

export interface Peminjaman {
    id: number;
    user_id: number;
    arsip_id: number;
    tgl_pinjam: string | null;
    tgl_estimasi_kembali: string;
    keperluan: string;
    status: StatusPeminjaman;
    catatan: string | null;
    created_at: string;
    // Relations
    user?: User;
    arsip?: Arsip;
    pengembalian?: Pengembalian;
    // Accessor
    terlambat?: boolean;
}

export interface Pengembalian {
    id: number;
    peminjaman_id: number;
    tgl_kembali: string;
    kondisi_dokumen: KondisiDokumen;
    catatan: string | null;
    status: string;
    created_at: string;
    // Relations
    peminjaman?: Peminjaman;
}

export interface RiwayatArsip {
    id: number;
    arsip_id: number;
    user_id: number | null;
    jenis_riwayat: string;
    keterangan: string | null;
    waktu: string;
    // Relations
    arsip?: Arsip;
    user?: User;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface StatistikArsip {
    total: number;
    tersedia: number;
    dipinjam: number;
    dalam_proses: number;
    hilang: number;
    arsip_lama: number;
}

export interface StatistikPeminjaman {
    menunggu: number;
    disetujui: number;
    dipinjam: number;
    dikembalikan: number;
    ditolak: number;
}
