<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductCostHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'inventory_document_id',
        'inventory_document_line_id',
        'cost',
        'average_cost',
        'quantity',
        'total_cost',
        'recorded_at',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'average_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
        'quantity' => 'integer',
        'recorded_at' => 'datetime',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function document()
    {
        return $this->belongsTo(InventoryDocument::class, 'inventory_document_id');
    }

    public function line()
    {
        return $this->belongsTo(InventoryDocumentLine::class, 'inventory_document_line_id');
    }
}
