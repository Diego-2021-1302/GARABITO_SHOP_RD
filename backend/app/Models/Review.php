<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'order_item_id',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'helpful_count',
        'unhelpful_count',
    ];

    protected $casts = [
        'is_verified_purchase' => 'boolean',
    ];

    /**
     * Get product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get order item
     */
    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
