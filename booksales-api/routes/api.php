<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// ================= AUTH (Publik) =================
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// ================= KATALOG (Publik) =================
Route::get('/books', [BookController::class, 'index']);
Route::get('/books/{id}', [BookController::class, 'show']);
Route::get('/authors', [AuthorController::class, 'index']);
Route::get('/authors/{id}', [AuthorController::class, 'show']);
Route::get('/genres', [GenreController::class, 'index']);
Route::get('/genres/{id}', [GenreController::class, 'show']);

// ================= KONTAK & PEMBAYARAN (Publik) =================
Route::post('/contacts', [ContactController::class, 'store']);
Route::post('/payments/notification', [PaymentController::class, 'notification']);
Route::get('/payments/finish', [PaymentController::class, 'finish']);

// ================= AUTHENTICATED (Admin & Customer) =================
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', function () {
        return response()->json([
            'success' => true,
            'data' => auth('api')->user(),
        ]);
    });

    Route::get('/my-orders', [TransactionController::class, 'myOrders']);

    Route::get('/transactions/{id}', [TransactionController::class, 'show']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::post('/checkout', [TransactionController::class, 'checkout']);
    Route::post('/transactions/{id}/pay', [TransactionController::class, 'pay']);
});

// ================= CUSTOMER =================
Route::middleware(['auth:api', 'role:customer'])->group(function () {
    Route::post('/transactions', [TransactionController::class, 'store']);
});

// ================= ADMIN =================
Route::middleware(['auth:api', 'role:admin'])->group(function () {
    // Buku
    Route::post('/books', [BookController::class, 'store']);
    Route::put('/books/{id}', [BookController::class, 'update']);
    Route::delete('/books/{id}', [BookController::class, 'destroy']);

    // Kategori / Genre
    Route::post('/genres', [GenreController::class, 'store']);
    Route::put('/genres/{id}', [GenreController::class, 'update']);
    Route::delete('/genres/{id}', [GenreController::class, 'destroy']);

    // Author
    Route::post('/authors', [AuthorController::class, 'store']);
    Route::put('/authors/{id}', [AuthorController::class, 'update']);
    Route::delete('/authors/{id}', [AuthorController::class, 'destroy']);

    // User terdaftar
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Pesanan
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);

    // Pesan kontak
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::put('/contacts/{id}', [ContactController::class, 'update']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
});
