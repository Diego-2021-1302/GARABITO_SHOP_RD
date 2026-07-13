<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('amount_paid', 12, 2)->nullable()->after('payment_proof');
            $table->string('issuing_bank')->nullable()->after('amount_paid');
            $table->string('transaction_reference')->nullable()->after('issuing_bank');
            $table->integer('payment_attempts')->default(0)->after('transaction_reference');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['amount_paid', 'issuing_bank', 'transaction_reference', 'payment_attempts']);
        });
    }
};
