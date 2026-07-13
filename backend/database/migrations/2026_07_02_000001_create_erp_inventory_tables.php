<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('manager')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('inventory_documents', function (Blueprint $table) {
            $table->id();
            $table->enum('document_type', [
                'purchase_order',
                'purchase_invoice',
                'goods_receipt',
                'sales_order',
                'sales_invoice',
                'customer_return',
                'supplier_return',
                'inventory_adjustment',
                'transfer',
                'physical_count'
            ]);
            $table->string('document_number')->nullable();
            $table->string('reference_number')->nullable();
            $table->foreignId('provider_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null');
            $table->foreignId('destination_warehouse_id')->nullable()->constrained('warehouses')->onDelete('set null');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['draft', 'pending', 'received', 'completed', 'paid', 'cancelled', 'void'])->default('draft');
            $table->date('issue_date')->nullable();
            $table->date('due_date')->nullable();
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('document_type');
            $table->index('document_number');
            $table->index('provider_id');
            $table->index('warehouse_id');
            $table->index('status');
        });

        Schema::create('inventory_document_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_document_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->integer('quantity');
            $table->integer('quantity_received')->default(0);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->string('lot_number')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('inventory_document_id');
            $table->index('product_id');
        });

        Schema::create('product_cost_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_document_id')->nullable()->constrained('inventory_documents')->onDelete('set null');
            $table->foreignId('inventory_document_line_id')->nullable()->constrained('inventory_document_lines')->onDelete('set null');
            $table->decimal('cost', 15, 2)->default(0);
            $table->decimal('average_cost', 15, 2)->default(0);
            $table->integer('quantity')->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->index('product_id');
            $table->index('inventory_document_id');
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('ip_address', 45)->nullable();
            $table->string('action');
            $table->string('auditable_type');
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['auditable_type', 'auditable_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('product_cost_histories');
        Schema::dropIfExists('inventory_document_lines');
        Schema::dropIfExists('inventory_documents');
        Schema::dropIfExists('warehouses');
    }
};
