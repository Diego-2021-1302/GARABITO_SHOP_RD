<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'payment_proof')) {
                $table->string('payment_proof')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'proof_uploaded_at')) {
                $table->timestamp('proof_uploaded_at')->nullable()->after('payment_proof');
            }
            if (!Schema::hasColumn('orders', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('proof_uploaded_at');
            }
            if (!Schema::hasColumn('orders', 'preparing_at')) {
                $table->timestamp('preparing_at')->nullable()->after('paid_at');
            }
            if (!Schema::hasColumn('orders', 'ready_for_shipping_at')) {
                $table->timestamp('ready_for_shipping_at')->nullable()->after('preparing_at');
            }
            if (!Schema::hasColumn('orders', 'invoice_pdf_path')) {
                $table->string('invoice_pdf_path')->nullable()->after('ready_for_shipping_at');
            }
        });

        Schema::table('shipments', function (Blueprint $table) {
            if (!Schema::hasColumn('shipments', 'driver_id')) {
                $table->foreignId('driver_id')->nullable()->constrained('users')->onDelete('set null');
            }
            if (!Schema::hasColumn('shipments', 'current_lat')) {
                $table->decimal('current_lat', 10, 8)->nullable();
            }
            if (!Schema::hasColumn('shipments', 'current_lng')) {
                $table->decimal('current_lng', 11, 8)->nullable();
            }
            if (!Schema::hasColumn('shipments', 'last_location_update')) {
                $table->timestamp('last_location_update')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_proof', 'proof_uploaded_at', 'preparing_at', 'ready_for_shipping_at']);
        });

        Schema::table('shipments', function (Blueprint $table) {
            $table->dropForeign(['driver_id']);
            $table->dropColumn(['driver_id', 'current_lat', 'current_lng', 'last_location_update']);
        });
    }
};
