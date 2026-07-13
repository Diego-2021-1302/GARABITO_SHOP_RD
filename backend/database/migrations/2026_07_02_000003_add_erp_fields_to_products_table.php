<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('internal_code')->nullable()->after('sku')->unique();
            $table->string('barcode')->nullable()->after('internal_code')->unique();
            $table->foreignId('main_provider_id')->nullable()->after('category_id')->constrained('providers')->onDelete('set null');
            $table->string('unit_of_measurement')->nullable()->after('brand');
            $table->decimal('weight', 10, 2)->nullable()->after('unit_of_measurement');
            $table->integer('minimum_stock')->default(0)->after('stock_quantity');
            $table->integer('maximum_stock')->default(0)->after('minimum_stock');
            $table->integer('reserved_stock')->default(0)->after('maximum_stock');
            $table->integer('available_stock')->default(0)->after('reserved_stock');
            // Actualizado para incluir instock, outofstock y lowstock
            $table->enum('stock_status', [
                'instock',
                'outofstock',
                'lowstock',
                'available',
                'reserved',
                'committed',
                'in_transit',
                'damaged',
                'expired'
            ])->default('instock')->after('available_stock');

            $table->string('location')->nullable()->after('stock_status');
            $table->string('qr_code')->nullable()->after('location');
            $table->decimal('average_cost', 15, 2)->nullable()->after('cost');
            $table->decimal('last_cost', 15, 2)->nullable()->after('average_cost');
            $table->timestamp('last_cost_updated_at')->nullable()->after('last_cost');

            $table->index('internal_code');
            $table->index('barcode');
            $table->index('main_provider_id');
            $table->index('stock_status');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['main_provider_id']);
            $table->dropColumn([
                'internal_code',
                'barcode',
                'main_provider_id',
                'unit_of_measurement',
                'weight',
                'minimum_stock',
                'maximum_stock',
                'reserved_stock',
                'available_stock',
                'stock_status',
                'location',
                'qr_code',
                'average_cost',
                'last_cost',
                'last_cost_updated_at',
            ]);
        });
    }
};
