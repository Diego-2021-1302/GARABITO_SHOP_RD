<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $blueprint) {
            $blueprint->string('alias')->nullable()->after('type');
            $blueprint->string('calle')->nullable()->after('sector');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $blueprint) {
            $blueprint->dropColumn(['alias', 'calle']);
        });
    }
};
