<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'driver_id',
        'tracking_number',
        'carrier',
        'status',
        'current_lat',
        'current_lng',
        'last_location_update',
        'shipped_date',
        'estimated_delivery',
        'actual_delivery',
        'notes',
    ];

    protected $casts = [
        'shipped_date' => 'datetime',
        'estimated_delivery' => 'datetime',
        'actual_delivery' => 'datetime',
        'last_location_update' => 'datetime',
        'current_lat' => 'decimal:8',
        'current_lng' => 'decimal:8',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_IN_TRANSIT = 'in_transit';
    const STATUS_OUT_FOR_DELIVERY = 'out_for_delivery';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_FAILED = 'failed';

    /**
     * Get order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get driver
     */
    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
