<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'inventory_document_id',
        'warehouse_id',
        'purchase_invoice_id',
        'quantity',
        'type',
        'movement_category',
        'quantity_before',
        'quantity_after',
        'cost_unit',
        'cost_total',
        'reference',
        'serial_number',
        'reason',
        'notes',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'quantity_before' => 'integer',
        'quantity_after' => 'integer',
        'cost_unit' => 'decimal:2',
        'cost_total' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function purchaseInvoice()
    {
        return $this->belongsTo(PurchaseInvoice::class);
    }

    public function inventoryDocument()
    {
        return $this->belongsTo(InventoryDocument::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
