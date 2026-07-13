<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->integer('payment_terms_days')->default(0)->after('contact_person');
            $table->string('payment_conditions')->nullable()->after('payment_terms_days');
            $table->decimal('credit_limit', 15, 2)->default(0)->after('payment_conditions');
            $table->decimal('outstanding_balance', 15, 2)->default(0)->after('credit_limit');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('outstanding_balance');

            $table->index('status');
            $table->index('credit_limit');
        });
    }

    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn([
                'payment_terms_days',
                'payment_conditions',
                'credit_limit',
                'outstanding_balance',
                'status',
            ]);
        });
    }
};
