<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'brand' => $this->brandRelation ? $this->brandRelation->name : $this->brand,
            'brandId' => $this->brand_id,
            'description' => $this->description,
            'price' => (float) $this->price,
            'cost' => $this->cost ? (float) $this->cost : null,
            'discountPrice' => $this->discount_price ? (float) $this->discount_price : null,
            'category' => $this->category ? $this->category->name : 'General',
            'categoryId' => $this->category_id,
            'rating' => (float) $this->rating,
            'reviewsCount' => (int) $this->reviews_count,
            'images' => $this->images->pluck('image_url')->toArray() ?: ['https://via.placeholder.com/800'],
            'stock' => (int) $this->stock_quantity,
            'availableStock' => (int) $this->available_stock,
            'reservedStock' => (int) $this->reserved_stock,
            'minimumStock' => (int) $this->minimum_stock,
            'maximumStock' => (int) $this->maximum_stock,
            'stockStatus' => $this->stock_status,
            'location' => $this->location,
            'qrCode' => $this->qr_code,
            'internalCode' => $this->internal_code,
            'barcode' => $this->barcode,
            'unitOfMeasurement' => $this->unit_of_measurement,
            'weight' => $this->weight !== null ? (float) $this->weight : null,
            'averageCost' => $this->average_cost !== null ? (float) $this->average_cost : null,
            'lastCost' => $this->last_cost !== null ? (float) $this->last_cost : null,
            'lastCostUpdatedAt' => $this->last_cost_updated_at instanceof \Carbon\Carbon
                ? $this->last_cost_updated_at->toDateTimeString()
                : (is_string($this->last_cost_updated_at) ? $this->last_cost_updated_at : null),
            'mainProviderId' => $this->main_provider_id,
            'mainProviderName' => $this->mainProvider ? $this->mainProvider->commercial_name : null,
            'isActive' => (bool) $this->is_active,
            'status' => $this->is_active ? 'active' : 'inactive',
            'isNew' => (bool) $this->is_new,
            'isFeatured' => (bool) $this->featured,
            'sku' => $this->sku,
            'specifications' => $this->specifications,
            'warranty' => $this->warranty,
        ];
    }
}
