<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Super Admin
        User::firstOrCreate(
            ['email' => 'inekeberliana11@gmail.com'],
            [
                'name'         => 'Super Admin',
                'no_karyawan'  => 'ADM-001',
                'password'     => 'admin123',
                'role'         => 'admin',
                'no_hp'        => '081234567890',
                'status'       => 'aktif',
            ]
        );

        // Customer Services 1
        User::firstOrCreate(
            ['email' => 'cs1@sidosir.com'],
            [
                'name'         => 'Siti Customer Service',
                'no_karyawan'  => 'CS-001',
                'password'     => bcrypt('password'),
                'role'         => 'customer_services',
                'no_hp'        => '082345678901',
                'status'       => 'aktif',
            ]
        );

        // Customer Services 2
        User::firstOrCreate(
            ['email' => 'cs2@sidosir.com'],
            [
                'name'         => 'Rina Pelayanan',
                'no_karyawan'  => 'CS-002',
                'password'     => bcrypt('password'),
                'role'         => 'customer_services',
                'no_hp'        => '085678901234',
                'status'       => 'aktif',
            ]
        );

    }
}
