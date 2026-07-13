<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->timestamp('last_purchase_at')->nullable()->after('last_cost_updated_at');
            $table->timestamp('last_sale_at')->nullable()->after('last_purchase_at');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['last_purchase_at', 'last_sale_at']);
        });
    }
};
