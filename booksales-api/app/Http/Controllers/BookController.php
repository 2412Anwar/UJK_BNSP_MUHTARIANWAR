<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['author', 'genre']);

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('author', function ($author) use ($search) {
                        $author->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('genre', function ($genre) use ($search) {
                        $genre->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('genre_id')) {
            $query->where('genre_id', $request->genre_id);
        }

        $books = $query->latest()->get();

        return response()->json([
            'success' => true,
            'message' => 'Get all books',
            'data' => $books,
        ], 200);
    }

    public function show($id)
    {
        $book = Book::with(['author', 'genre'])->find($id);

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail buku',
            'data' => $book,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $book = Book::create($this->payload($request));

        return response()->json([
            'success' => true,
            'message' => 'Buku berhasil ditambahkan.',
            'data' => $book->load(['author', 'genre']),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $book = Book::find($id);

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), $this->rules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $book->update($this->payload($request));

        return response()->json([
            'success' => true,
            'message' => 'Buku berhasil diperbarui.',
            'data' => $book->load(['author', 'genre']),
        ], 200);
    }

    public function destroy($id)
    {
        $book = Book::find($id);

        if (! $book) {
            return response()->json([
                'success' => false,
                'message' => 'Buku tidak ditemukan.',
            ], 404);
        }

        $book->delete();

        return response()->json([
            'success' => true,
            'message' => 'Buku berhasil dihapus.',
        ], 200);
    }

    private function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cover' => 'nullable|string|max:2048',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'author_id' => 'required|integer|exists:authors,id',
            'genre_id' => 'nullable|integer|exists:genres,id',
        ];
    }

    private function payload(Request $request): array
    {
        return [
            'title' => $request->title,
            'description' => $request->description,
            'cover' => $request->cover,
            'price' => $request->price,
            'stock' => $request->stock,
            'author_id' => $request->author_id,
            'genre_id' => $request->genre_id,
        ];
    }
}
