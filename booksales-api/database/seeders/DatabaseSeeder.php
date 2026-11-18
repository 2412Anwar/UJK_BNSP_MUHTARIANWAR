<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Administrator',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'customer@example.com'],
            [
                'name' => 'Customer Test',
                'username' => 'customer',
                'password' => Hash::make('customer123'),
                'role' => 'customer',
            ]
        );

        $this->call([
            GenreSeeder::class,
            AuthorSeeder::class,
            BookSeeder::class,
        ]);
    }
}
