<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ProductImage;

$images = ProductImage::all();
if ($images->isEmpty()) {
    echo "No product images found\n";
    exit;
}
foreach ($images as $i) {
    echo $i->id . ' => ' . $i->image_url . PHP_EOL;
}
