<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // En PostgreSQL (Neon), el comando MODIFY COLUMN no existe.
        // Convertimos la columna a string para máxima compatibilidad y flexibilidad.
        Schema::table('products', function (Blueprint $table) {
            $table->string('stock_status', 50)->default('instock')->change();
        });
    }

    public function down(): void
    {
        // No revertimos a ENUM porque causa problemas de tipos en Postgres durante migraciones
        Schema::table('products', function (Blueprint $table) {
            $table->string('stock_status', 50)->default('instock')->change();
        });
    }
};
