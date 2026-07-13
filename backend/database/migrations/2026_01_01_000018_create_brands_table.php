<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('brands', function (Blueprint $col) {
            $col->id();
            $col->string('name');
            $col->string('slug')->unique();
            $col->string('logo_url')->nullable();
            $col->text('description')->nullable();
            $col->boolean('is_active')->default(true);
            $col->timestamps();
        });

        // Añadir brand_id a la tabla de productos
        Schema::table('products', function (Blueprint $col) {
            $col->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::table('products', function (Blueprint $col) {
            $col->dropConstrainedForeignId('brand_id');
        });
        Schema::dropIfExists('brands');
    }
};
