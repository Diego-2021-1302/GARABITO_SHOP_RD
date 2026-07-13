<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_documents', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->after('destination_warehouse_id')->constrained()->onDelete('set null');
            $table->foreignId('purchase_invoice_id')->nullable()->after('order_id')->constrained('purchase_invoices')->onDelete('set null');

            $table->index('order_id');
            $table->index('purchase_invoice_id');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_documents', function (Blueprint $table) {
            $table->dropForeign(['order_id']);
            $table->dropForeign(['purchase_invoice_id']);
            $table->dropColumn(['order_id', 'purchase_invoice_id']);
        });
    }
};
