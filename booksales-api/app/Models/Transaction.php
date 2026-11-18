<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'user_id',
        'book_id',
        'quantity',
        'total_amount',
        'status',
        'payment_group',
        'payment_method',
        'payment_status',
        'snap_token',
        'snap_url',
        'phone',
        'shipping_address',
        'paid_at',
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'total_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function book()
    {
        return $this->belongsTo(Book::class);
    }
}
