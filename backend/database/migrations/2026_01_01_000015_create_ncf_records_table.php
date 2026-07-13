<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ncf_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('ncf')->unique(); // NCF: B0100000001
            $table->string('ncf_type')->default('02'); // 01: Crédito, 02: Consumidor, etc.
            $table->string('rnc_cedula')->nullable();
            $table->string('business_name')->nullable();
            $table->timestamp('issued_date');
            $table->decimal('amount', 10, 2);
            $table->string('status')->default('issued'); // issued, cancelled
            $table->string('dgii_sync_status')->default('pending');
            $table->timestamps();

            $table->index('order_id');
            $table->index('ncf');
            $table->index('rnc_cedula');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ncf_records');
    }
};
