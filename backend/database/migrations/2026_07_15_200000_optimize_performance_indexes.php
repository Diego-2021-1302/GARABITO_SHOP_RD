<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('products', function (Blueprint $table) {
            $table->index('slug');
            $table->index('sku');
            $table->index(['is_active', 'featured']); // Índice compuesto para el Home
            $table->index('category_id');
            $table->index('brand_id');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->index('order_number');
            $table->index('status');
            $table->index('user_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->index('order_id');
            $table->index('product_id');
        });
    }

    public function down(): void {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['slug', 'sku', 'is_active', 'featured', 'category_id', 'brand_id']);
        });
    }
};
