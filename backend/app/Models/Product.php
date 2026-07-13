<?php

namespace App\Models;

use App\Models\InventoryMovement;
use App\Models\Provider;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'brand',
        'brand_id',
        'description',
        'price',
        'discount_price',
        'cost',
        'average_cost',
        'last_cost',
        'last_cost_updated_at',
        'last_purchase_at',
        'last_sale_at',
        'category_id',
        'main_provider_id',
        'stock_quantity',
        'reserved_stock',
        'available_stock',
        'minimum_stock',
        'maximum_stock',
        'stock_status',
        'sku',
        'internal_code',
        'barcode',
        'unit_of_measurement',
        'weight',
        'location',
        'qr_code',
        'rating',
        'reviews_count',
        'is_active',
        'featured',
        'is_new',
        'specifications',
        'warranty',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount_price' => 'decimal:2',
        'cost' => 'decimal:2',
        'average_cost' => 'decimal:2',
        'last_cost' => 'decimal:2',
        'last_cost_updated_at' => 'datetime',
        'last_purchase_at' => 'datetime',
        'last_sale_at' => 'datetime',
        'weight' => 'decimal:2',
        'stock_quantity' => 'integer',
        'reserved_stock' => 'integer',
        'available_stock' => 'integer',
        'minimum_stock' => 'integer',
        'maximum_stock' => 'integer',
        'rating' => 'decimal:2',
        'is_active' => 'boolean',
        'featured' => 'boolean',
        'is_new' => 'boolean',
        'specifications' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });

        static::saving(function ($product) {
            // Recalcular stock disponible
            $product->available_stock = max(0, (int)$product->stock_quantity - (int)($product->reserved_stock ?? 0));

            // Asignar estado de stock (Valores cortos para evitar truncado SQL)
            // 'instock' (8 chars), 'outofstock' (9 chars), 'lowstock' (8 chars)
            if ($product->available_stock <= 0) {
                $product->stock_status = 'outofstock';
            } elseif ($product->available_stock <= ($product->minimum_stock ?? 5)) {
                $product->stock_status = 'lowstock';
            } else {
                $product->stock_status = 'instock';
            }
        });
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brandRelation()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists()
    {
        return $this->belongsToMany(Wishlist::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function mainProvider()
    {
        return $this->belongsTo(Provider::class, 'main_provider_id');
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }
}
