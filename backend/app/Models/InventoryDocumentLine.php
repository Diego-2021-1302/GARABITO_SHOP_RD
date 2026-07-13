<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryDocumentLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_document_id',
        'product_id',
        'quantity',
        'quantity_received',
        'unit_cost',
        'unit_price',
        'discount',
        'tax',
        'subtotal',
        'total',
        'lot_number',
        'expiration_date',
        'location',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_received' => 'integer',
        'unit_cost' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'expiration_date' => 'date',
    ];

    public function document()
    {
        return $this->belongsTo(InventoryDocument::class, 'inventory_document_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
