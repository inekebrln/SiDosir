<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * Halaman daftar user.
     */
    public function index(Request $request)
    {
        return Inertia::render('admin/users/index', [
            'users'     => $this->userService->daftar($request->only('q', 'role', 'status'), 5),
            'keyword'   => $request->get('q', ''),
            'filter'    => $request->get('role', ''),
            'statistik' => $this->userService->statistik(),
        ]);
    }

    /**
     * Simpan user baru.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email',
            'password'     => 'required|string|min:8',
            'no_karyawan'  => 'nullable|string|max:50|unique:users,no_karyawan',
            'role'         => 'required|in:admin,customer_services',
            'no_hp'        => 'nullable|string|max:20',
            'status'       => 'required|in:aktif,nonaktif',
        ]);

        $this->userService->buat($validated);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    /**
     * Update data user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'email'        => 'required|email|unique:users,email,' . $user->id,
            'password'     => 'nullable|string|min:8',
            'no_karyawan'  => 'nullable|string|max:50|unique:users,no_karyawan,' . $user->id,
            'role'         => 'required|in:admin,customer_services',
            'no_hp'        => 'nullable|string|max:20',
            'status'       => 'required|in:aktif,nonaktif',
        ]);

        $this->userService->update($user, $validated);

        return back()->with('success', 'Data user berhasil diperbarui.');
    }

    /**
     * Hapus user.
     */
    public function destroy(User $user)
    {
        if (! $this->userService->hapus($user)) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        return back()->with('success', 'User berhasil dihapus.');
    }

    /**
     * Toggle status aktif/nonaktif.
     */
    public function toggleStatus(User $user)
    {
        $this->userService->toggleStatus($user);

        return back()->with('success', 'Status user berhasil diubah.');
    }
}
