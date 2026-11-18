<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use App\Models\Genre;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    public function run(): void
    {
        $genres = Genre::pluck('id', 'name');
        $authors = Author::pluck('id', 'name');

        $books = [
            ['title' => 'Bumi', 'description' => 'Novel petualangan dunia paralel.', 'price' => 95000, 'stock' => 20, 'author' => 'Tere Liye', 'genre' => 'Fantasi', 'cover' => '/images/books/bumi.jpg'],
            ['title' => 'Laskar Pelangi', 'description' => 'Kisah inspiratif anak-anak Belitung.', 'price' => 85000, 'stock' => 15, 'author' => 'Andrea Hirata', 'genre' => 'Action', 'cover' => '/images/books/laskar-pelangi.jpg'],
            ['title' => 'Bumi Manusia', 'description' => 'Kisah sejarah perjuangan Minke.', 'price' => 120000, 'stock' => 10, 'author' => 'Pramoedya Ananta Toer', 'genre' => 'Action', 'cover' => '/images/books/bumi-manusia.jpg'],
            ['title' => 'Supernova', 'description' => 'Novel fiksi ilmiah romansa.', 'price' => 90000, 'stock' => 12, 'author' => 'Dee Lestari', 'genre' => 'Fantasi', 'cover' => '/images/books/supernova.jpg'],
            ['title' => 'Garis Waktu', 'description' => 'Kumpulan cerita dan puisi.', 'price' => 75000, 'stock' => 18, 'author' => 'Fiersa Besari', 'genre' => 'Romance', 'cover' => '/images/books/garis-waktu.jpg'],
        ];

        foreach ($books as $book) {
            $data = [
                'title' => $book['title'],
                'description' => $book['description'],
                'price' => $book['price'],
                'stock' => $book['stock'],
                'author_id' => $authors[$book['author']],
                'genre_id' => $genres[$book['genre']],
                'cover' => $book['cover'],
            ];

            Book::updateOrCreate(['title' => $book['title']], $data);
        }
    }
}
