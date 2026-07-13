<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value');
            $table->timestamps();
        });

        // Insert default settings
        \Illuminate\Support\Facades\DB::table('store_settings')->insert([
            [
                'key' => 'general',
                'value' => json_encode([
                    'storeName' => 'Garabito Shop RD',
                    'slogan' => 'Tecnología, calidad y confianza en un solo lugar.',
                    'contactEmail' => 'info@garabitoshop.com.do',
                    'supportPhone' => '+1 (809) 000-0000',
                    'logoLight' => null,
                    'logoDark' => null,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'payments',
                'value' => json_encode([
                    'azulActive' => true,
                    'cardnetActive' => false,
                    'paypalActive' => true,
                    'transferActive' => true,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'shipping',
                'value' => json_encode([
                    'zones' => [
                        ['id' => '1', 'name' => 'Distrito Nacional', 'time' => '24 horas', 'cost' => 250, 'freeFrom' => 5000],
                        ['id' => '2', 'name' => 'Gran Santo Domingo', 'time' => '24-48 horas', 'cost' => 350, 'freeFrom' => 7000],
                        ['id' => '3', 'name' => 'Interior del País', 'time' => '48-72 horas', 'cost' => 500, 'freeFrom' => 10000],
                    ],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'notifications',
                'value' => json_encode([
                    'orderEmails' => true,
                    'stockAlerts' => true,
                    'newCustomers' => false,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'security',
                'value' => json_encode([
                    'twoFactorAuth' => false,
                    'sessionTimeout' => 60,
                    'passwordExpiration' => 90,
                    'failedAttemptsLimit' => 5,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key' => 'email',
                'value' => json_encode([
                    'provider' => 'smtp',
                    'fromName' => 'Garabito Shop',
                    'fromEmail' => 'no-reply@garabitoshop.com.do',
                    'smtpHost' => 'smtp.mailtrap.io',
                    'smtpPort' => 2525,
                    'marketingNewsletter' => true,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
