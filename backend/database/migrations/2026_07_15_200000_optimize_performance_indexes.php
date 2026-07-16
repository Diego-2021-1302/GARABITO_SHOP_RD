<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        try {
            Schema::table('products', function (Blueprint $table) {
                // Usamos try-catch manual o comprobación de driver si es necesario,
                // pero para simplificar lo haremos uno por uno ignorando errores de duplicado
                try { $table->index('slug'); } catch (\Exception $e) {}
                try { $table->index('sku'); } catch (\Exception $e) {}
                try { $table->index(['is_active', 'featured']); } catch (\Exception $e) {}
                try { $table->index('category_id'); } catch (\Exception $e) {}
                try { $table->index('brand_id'); } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('orders', function (Blueprint $table) {
                try { $table->index('order_number'); } catch (\Exception $e) {}
                try { $table->index('status'); } catch (\Exception $e) {}
                try { $table->index('user_id'); } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}

        try {
            Schema::table('order_items', function (Blueprint $table) {
                try { $table->index('order_id'); } catch (\Exception $e) {}
                try { $table->index('product_id'); } catch (\Exception $e) {}
            });
        } catch (\Exception $e) {}
    }

    public function down(): void {
        // Nada en down para evitar errores de índices inexistentes
    }
};
