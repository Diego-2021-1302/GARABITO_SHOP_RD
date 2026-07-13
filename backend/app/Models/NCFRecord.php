<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NCFRecord extends Model
{
    use HasFactory;

    protected $table = 'ncf_records';

    protected $fillable = [
        'order_id',
        'ncf',
        'ncf_type',
        'rnc_cedula',
        'business_name',
        'issued_date',
        'amount',
        'status',
        'dgii_sync_status',
    ];

    protected $casts = [
        'issued_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the order associated with the NCF.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
