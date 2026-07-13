<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$email = 'devadmin@example.com';
$user = User::where('email', $email)->first();
if (!$user) {
    $user = User::create([
        'name' => 'Dev Admin',
        'email' => $email,
        'password' => bcrypt('secret123'),
        'role' => User::ROLE_ADMIN,
        'is_active' => 1,
    ]);
}
$token = $user->createToken('dev-token')->plainTextToken;
echo $token . PHP_EOL;