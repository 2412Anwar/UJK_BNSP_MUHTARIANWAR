<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Services\MidtransService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function notification(Request $request, MidtransService $midtrans)
    {
        $payload = $request->all();

        if (! $midtrans->isValidSignature($payload)) {
            return response()->json([
                'success' => false,
                'message' => 'Signature tidak valid.',
            ], 403);
        }

        $orderId = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        $transactions = Transaction::where('payment_group', $orderId)
            ->orWhere('order_number', $orderId)
            ->get();

        if ($transactions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan tidak ditemukan.',
            ], 404);
        }

        $isPaid = in_array($transactionStatus, ['capture', 'settlement']);
        $isFailed = in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure']);

        foreach ($transactions as $transaction) {
            if ($isPaid) {
                $transaction->update([
                    'status' => 'paid',
                    'payment_status' => 'paid',
                    'paid_at' => now(),
                ]);
            } elseif ($isFailed) {
                $transaction->update([
                    'status' => 'cancelled',
                    'payment_status' => 'failed',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi pembayaran diterima.',
        ], 200);
    }

    public function finish(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Terima kasih, pembayaran sedang diverifikasi.',
            'order_id' => $request->query('order_id'),
            'status' => $request->query('transaction_status'),
        ], 200);
    }
}
