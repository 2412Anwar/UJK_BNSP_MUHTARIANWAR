<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class MidtransService
{
    public function isConfigured(): bool
    {
        return filled(config('midtrans.server_key'));
    }

    public function createSnapTransaction(string $paymentGroup, $transactions, $user): ?array
    {
        if (! $this->isConfigured() || $transactions->isEmpty()) {
            return null;
        }

        $grossAmount = (int) round($transactions->sum('total_amount'));

        $itemDetails = $transactions->map(function (Transaction $transaction) {
            return [
                'id' => (string) $transaction->book_id,
                'price' => (int) round($transaction->book->price),
                'quantity' => (int) $transaction->quantity,
                'name' => mb_substr($transaction->book->title, 0, 50),
            ];
        })->values()->all();

        $payload = [
            'transaction_details' => [
                'order_id' => $paymentGroup,
                'gross_amount' => $grossAmount,
            ],
            'item_details' => $itemDetails,
            'customer_details' => [
                'first_name' => $user?->name ?? 'Customer',
                'email' => $user?->email,
            ],
            'callbacks' => [
                'finish' => config('midtrans.finish_url'),
            ],
        ];

        $baseUrl = config('midtrans.is_production')
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        try {
            $response = Http::timeout(15)
                ->withBasicAuth(config('midtrans.server_key'), '')
                ->acceptJson()
                ->post($baseUrl, $payload);
        } catch (ConnectionException) {
            return null;
        }

        if (! $response->successful() || blank($response->json('token')) || blank($response->json('redirect_url'))) {
            return null;
        }

        return [
            'token' => $response->json('token'),
            'redirect_url' => $response->json('redirect_url'),
        ];
    }

    public function isValidSignature(array $payload): bool
    {
        if (blank(config('midtrans.server_key'))) {
            return false;
        }

        $signature = hash('sha512', ($payload['order_id'] ?? '')
            .($payload['status_code'] ?? '')
            .($payload['gross_amount'] ?? '')
            .config('midtrans.server_key'));

        return hash_equals($signature, (string) ($payload['signature_key'] ?? ''));
    }
}
