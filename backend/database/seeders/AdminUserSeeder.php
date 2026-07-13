<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Esto crea el usuario administrador de forma segura
        User::updateOrCreate(
            ['email' => 'diegoesmerlingarabito@gmail.com'], // Busca por este email
            [
                'name' => 'Diego Garabito',
                'phone' => '8498810114',
                'password' => Hash::make('tu_contraseña_aqui'), // Cambia 'tu_contraseña_aqui' por la real
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
