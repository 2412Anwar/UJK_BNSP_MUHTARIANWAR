<?php

namespace Database\Seeders;

use App\Models\Author;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    public function run(): void
    {
        $authors = [
            ['name' => 'Tere Liye', 'bio' => 'Penulis novel terkenal asal Indonesia.'],
            ['name' => 'Andrea Hirata', 'bio' => 'Penulis novel Laskar Pelangi.'],
            ['name' => 'Pramoedya Ananta Toer', 'bio' => 'Sastrawan legendaris Indonesia.'],
            ['name' => 'Dee Lestari', 'bio' => 'Penulis serial Supernova dan Gelombang.'],
            ['name' => 'Fiersa Besari', 'bio' => 'Penulis novel dan pemusik asal Bandung.'],
        ];

        foreach ($authors as $author) {
            Author::updateOrCreate(['name' => $author['name']], $author);
        }
    }
}
