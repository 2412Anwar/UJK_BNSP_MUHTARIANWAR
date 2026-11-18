<?php

namespace Database\Seeders;

use App\Models\Genre;
use Illuminate\Database\Seeder;

class GenreSeeder extends Seeder
{
    public function run(): void
    {
        $genres = [
            ['name' => 'Action', 'description' => 'Genre yang menekankan pada adegan aksi, pertempuran, dan kecepatan.'],
            ['name' => 'Romance', 'description' => 'Genre yang menekankan pada hubungan romantis dan cinta.'],
            ['name' => 'Fantasi', 'description' => 'Genre yang mengeksplorasi imajinasi dan dunia tak nyata.'],
        ];

        foreach ($genres as $genre) {
            Genre::updateOrCreate(['name' => $genre['name']], $genre);
        }
    }
}
