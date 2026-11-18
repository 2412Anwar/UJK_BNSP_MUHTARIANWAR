<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Cart;
use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index()
    {
        $transactions = Transaction::with(['user', 'book.author', 'book.genre'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan buku',
            'data' => $transactions,
        ], 200);
    }

    public function myOrders(Request $request)
    {
        $transactions = Transaction::with(['book.author', 'book.genre'])
            ->where(function ($query) use ($request) {
                $query->where('customer_id', $request->user()->id)
                    ->orWhere('user_id', $request->user()->id);
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Pesanan saya',
            'data' => $transactions,
        ], 200);
    }

    public function show(Request $request, $id)
    {
        $transaction = Transaction::with(['user', 'book.author', 'book.genre'])->find($id);

        if (! $transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();
        $isOwner = in_array($user->id, [$transaction->customer_id, $transaction->user_id]);

        if ($user->role !== 'admin' && ! $isOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan',
            'data' => $transaction,
        ], 200);
    }

    public function store(Request $request, MidtransService $midtrans)
    {
        $validator = Validator::make($request->all(), [
            'book_id' => 'required|integer|exists:books,id',
            'quantity' => 'required|integer|min:1',
            'phone' => 'nullable|string|max:30',
            'shipping_address' => 'nullable|string',
            'payment_method' => 'nullable|in:cod,midtrans',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->payment_method === 'midtrans' && ! $midtrans->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran Midtrans belum dikonfigurasi di server.',
            ], 503);
        }

        $book = Book::find($request->book_id);

        if ($book->stock < $request->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Stok buku tidak mencukupi.',
            ], 400);
        }

        $paymentGroup = 'PAY'.strtoupper(uniqid());

        $transaction = DB::transaction(function () use ($request, $book, $paymentGroup) {
            $transaction = Transaction::create([
                'order_number' => $paymentGroup.'-'.$book->id,
                'customer_id' => $request->user()->id,
                'user_id' => $request->user()->id,
                'book_id' => $book->id,
                'quantity' => $request->quantity,
                'total_amount' => $book->price * $request->quantity,
                'status' => 'pending',
                'payment_group' => $paymentGroup,
                'payment_method' => $request->payment_method ?? 'cod',
                'payment_status' => 'unpaid',
                'phone' => $request->phone,
                'shipping_address' => $request->shipping_address,
            ]);

            $book->decrement('stock', $request->quantity);

            return $transaction;
        });

        $snap = null;

        if ($transaction->payment_method === 'midtrans') {
            $snap = $midtrans->createSnapTransaction($paymentGroup, collect([$transaction->fresh('book')]), $request->user());

            if ($snap) {
                Transaction::where('payment_group', $paymentGroup)->update([
                    'snap_token' => $snap['token'],
                    'snap_url' => $snap['redirect_url'],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Transaksi berhasil dibuat',
            'data' => $transaction->fresh('book'),
            'payment_group' => $paymentGroup,
            'snap' => $snap,
            'midtrans_ready' => $midtrans->isConfigured(),
        ], 201);
    }

    public function checkout(Request $request, MidtransService $midtrans)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'nullable|string|max:30',
            'shipping_address' => 'required|string|min:5',
            'payment_method' => 'required|in:cod,midtrans',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Periksa kembali data pengiriman.',
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->payment_method === 'midtrans' && ! $midtrans->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran Midtrans belum dikonfigurasi di server.',
            ], 503);
        }

        $carts = Cart::with('book')
            ->where('user_id', $request->user()->id)
            ->get();

        if ($carts->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang masih kosong.',
            ], 400);
        }

        foreach ($carts as $cart) {
            if (! $cart->book || $cart->book->stock < $cart->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => "Stok buku {$cart->book?->title} tidak mencukupi.",
                ], 400);
            }
        }

        $paymentGroup = 'PAY'.strtoupper(uniqid());

        $transactions = DB::transaction(function () use ($request, $carts, $paymentGroup) {
            $created = collect();

            foreach ($carts as $cart) {
                $book = $cart->book;

                $created->push(Transaction::create([
                    'order_number' => $paymentGroup.'-'.$book->id,
                    'customer_id' => $request->user()->id,
                    'user_id' => $request->user()->id,
                    'book_id' => $book->id,
                    'quantity' => $cart->quantity,
                    'total_amount' => $book->price * $cart->quantity,
                    'status' => 'pending',
                    'payment_group' => $paymentGroup,
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'unpaid',
                    'phone' => $request->phone,
                    'shipping_address' => $request->shipping_address,
                ]));

                $book->decrement('stock', $cart->quantity);
            }

            Cart::where('user_id', $request->user()->id)->delete();

            return $created;
        });

        $createdTransactions = Transaction::with('book')
            ->where('payment_group', $paymentGroup)
            ->get();

        $snap = null;

        if ($request->payment_method === 'midtrans') {
            $snap = $midtrans->createSnapTransaction($paymentGroup, $createdTransactions, $request->user());

            if ($snap) {
                Transaction::where('payment_group', $paymentGroup)->update([
                    'snap_token' => $snap['token'],
                    'snap_url' => $snap['redirect_url'],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dibuat.',
            'data' => $createdTransactions,
            'payment_group' => $paymentGroup,
            'snap' => $snap,
            'midtrans_ready' => $midtrans->isConfigured(),
        ], 201);
    }

    public function pay(Request $request, $id, MidtransService $midtrans)
    {
        $transaction = Transaction::with('book')->find($id);

        if (! $transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $user = $request->user();

        if ($user->role !== 'admin' && ! in_array($user->id, [$transaction->customer_id, $transaction->user_id])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
            ], 403);
        }

        $transactions = Transaction::with('book')
            ->where('payment_group', $transaction->payment_group)
            ->get();

        $snap = $midtrans->createSnapTransaction($transaction->payment_group, $transactions, $user);

        if (! $snap) {
            return response()->json([
                'success' => false,
                'message' => 'Midtrans belum dikonfigurasi atau gagal membuat transaksi pembayaran.',
            ], 400);
        }

        Transaction::where('payment_group', $transaction->payment_group)->update([
            'snap_token' => $snap['token'],
            'snap_url' => $snap['redirect_url'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Token pembayaran dibuat.',
            'snap' => $snap,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $transaction = Transaction::find($id);

        if (! $transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'nullable|in:pending,paid,processing,shipped,completed,cancelled',
            'payment_status' => 'nullable|in:unpaid,paid,failed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $request->only(['status', 'payment_status']);

        if (($data['payment_status'] ?? null) === 'paid') {
            $data['paid_at'] = now();
        }

        if (in_array($data['status'] ?? null, ['paid', 'completed'], true)) {
            $data['payment_status'] = 'paid';
            $data['paid_at'] = $transaction->paid_at ?? now();
        }

        $transaction->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil diperbarui.',
            'data' => $transaction->fresh(['user', 'book']),
        ], 200);
    }

    public function destroy($id)
    {
        $transaction = Transaction::with('book')->find($id);

        if (! $transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        DB::transaction(function () use ($transaction) {
            if ($transaction->status !== 'cancelled' && $transaction->book) {
                $transaction->book->increment('stock', $transaction->quantity);
            }

            $transaction->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan berhasil dihapus.',
        ], 200);
    }
}
