<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_payments', function (Blueprint $label) {
            $label->id();
            $label->foreignId('purchase_invoice_id')->constrained()->onDelete('cascade');
            $label->date('payment_date');
            $label->decimal('amount', 15, 2);
            $label->string('bank_name');
            $label->string('transaction_number');
            $label->text('notes')->nullable();
            $label->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_payments');
    }
};
