<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->foreignId('inventory_document_id')->nullable()->after('user_id')->constrained('inventory_documents')->onDelete('set null');
            $table->foreignId('warehouse_id')->nullable()->after('inventory_document_id')->constrained('warehouses')->onDelete('set null');
            $table->enum('movement_category', ['purchase', 'sale', 'adjustment', 'transfer', 'supplier_return', 'customer_return', 'physical_count', 'other'])->default('other')->after('type');
            $table->integer('quantity_before')->nullable()->after('quantity');
            $table->integer('quantity_after')->nullable()->after('quantity_before');
            $table->decimal('cost_unit', 15, 2)->nullable()->after('quantity_after');
            $table->decimal('cost_total', 15, 2)->nullable()->after('cost_unit');
            $table->string('reference')->nullable()->after('reason');
            $table->string('serial_number')->nullable()->after('reference');
            $table->text('notes')->nullable()->after('serial_number');

            $table->index('inventory_document_id');
            $table->index('warehouse_id');
            $table->index('movement_category');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropForeign(['inventory_document_id']);
            $table->dropForeign(['warehouse_id']);
            $table->dropColumn([
                'inventory_document_id',
                'warehouse_id',
                'movement_category',
                'quantity_before',
                'quantity_after',
                'cost_unit',
                'cost_total',
                'reference',
                'serial_number',
                'notes',
            ]);
        });
    }
};
