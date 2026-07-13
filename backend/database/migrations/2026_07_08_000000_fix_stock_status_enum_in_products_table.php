<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Cambiamos a string temporalmente para evitar conflictos de ENUM al alterar
        Schema::table('products', function (Blueprint $table) {
            $table->string('stock_status')->default('instock')->change();
        });

        // Ahora lo volvemos a poner como ENUM con todos los valores necesarios
        // Usamos DB::statement porque Doctrine (usado por Schema::change) a veces tiene problemas con ENUMs en MySQL
        DB::statement("ALTER TABLE products MODIFY COLUMN stock_status ENUM(
            'instock',
            'outofstock',
            'lowstock',
            'available',
            'reserved',
            'committed',
            'in_transit',
            'damaged',
            'expired'
        ) DEFAULT 'instock'");
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('stock_status')->default('available')->change();
        });
    }
};
