<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use App\Mail\KredensialUserMail;
use Illuminate\Support\Facades\Mail;

class UserService
{
    /**
     * Daftar user dengan filter dan pagination.
     */
    public function daftar(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query()->latest();

        if (! empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('no_karyawan', 'like', "%{$q}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Statistik user berdasarkan role.
     */
    public function statistik(): array
    {
        return [
            'total'              => User::count(),
            'admin'              => User::where('role', 'admin')->count(),
            'customer_services'  => User::where('role', 'customer_services')->count(),
            'aktif'              => User::where('status', 'aktif')->count(),
            'nonaktif'           => User::where('status', 'nonaktif')->count(),
        ];
    }

    /**
     * Buat user baru.
     */
    public function buat(array $data): User
{
    $plainPassword = $data['password']; // simpan sebelum di-hash

    $data['password'] = Hash::make($data['password']);
    $data['two_factor_method'] = 'email';

    $user = User::create($data);

    // Kirim email kredensial ke karyawan
    try {
        Mail::to($user->email)->send(new KredensialUserMail($user, $plainPassword));
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\Log::warning('Gagal kirim email (biasanya karena limit Resend domain): ' . $e->getMessage());
    }

    return $user;
}

    public function update(User $user, array $data): User
    {
        // Hanya hash password jika diisi
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        // Sinkronisasi is_active dengan status dari form edit
        if (isset($data['status'])) {
            if ($data['status'] === 'aktif') {
                $data['is_active'] = true;
                $data['otp_failed_attempts'] = 0;
            } else {
                $data['is_active'] = false;
            }
        }

        $user->update($data);

        return $user->fresh();
    }

    /**
     * Hapus user (soft: nonaktifkan).
     */
    public function hapus(User $user): bool
    {
        // Jangan hapus diri sendiri
        if ($user->id === auth()->id()) {
            return false;
        }

        return $user->delete();
    }

    /**
     * Toggle status aktif/nonaktif.
     */
    public function toggleStatus(User $user): User
    {
        $newStatus = $user->status === 'aktif' ? 'nonaktif' : 'aktif';

        $updates = [
            'status' => $newStatus,
        ];

        if ($newStatus === 'aktif') {
            $updates['is_active'] = true;
            $updates['otp_failed_attempts'] = 0;
        } else {
            $updates['is_active'] = false;
        }

        $user->update($updates);

        return $user->fresh();
    }
}
