<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'transaction_id',
        'reference_number',
        'response_data',
        'error_message',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'response_data' => 'json',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_FAILED = 'failed';
    const STATUS_REFUNDED = 'refunded';

    const METHOD_AZUL = 'azul';
    const METHOD_CARDNET = 'cardnet';
    const METHOD_VISANET = 'visanet';
    const METHOD_TRANSFER = 'transfer';
    const METHOD_COD = 'cod'; // Contra Entrega

    /**
     * Get order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
