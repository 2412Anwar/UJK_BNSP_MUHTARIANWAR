<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $carts = Cart::with(['book.author', 'book.genre'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        $total = $carts->sum(function ($cart) {
            return $cart->book->price * $cart->quantity;
        });

        return response()->json([
            'success' => true,
            'message' => 'Isi keranjang',
            'data' => $carts,
            'total' => $total,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'book_id' => 'required|integer|exists:books,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $book = Book::find($request->book_id);
        $quantity = (int) ($request->quantity ?? 1);

        if ($book->stock < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok buku tidak mencukupi.',
            ], 400);
        }

        $cart = Cart::firstOrNew([
            'user_id' => $request->user()->id,
            'book_id' => $book->id,
        ]);

        $newQuantity = ($cart->exists ? $cart->quantity : 0) + $quantity;

        if ($newQuantity > $book->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah melebihi stok yang tersedia.',
            ], 400);
        }

        $cart->quantity = $newQuantity;
        $cart->save();

        return response()->json([
            'success' => true,
            'message' => 'Buku ditambahkan ke keranjang.',
            'data' => $cart->load('book'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $cart = Cart::with('book')
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $cart) {
            return response()->json([
                'success' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->quantity > $cart->book->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Jumlah melebihi stok yang tersedia.',
            ], 400);
        }

        $cart->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Jumlah buku diperbarui.',
            'data' => $cart->load('book'),
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $cart = Cart::where('user_id', $request->user()->id)->find($id);

        if (! $cart) {
            return response()->json([
                'success' => false,
                'message' => 'Item keranjang tidak ditemukan.',
            ], 404);
        }

        $cart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Buku dihapus dari keranjang.',
        ], 200);
    }
}
