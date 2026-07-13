<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ProductImage;

$images = ProductImage::all();
foreach ($images as $img) {
    $url = $img->image_url;
    $path = parse_url($url, PHP_URL_PATH) ?: $url;
    if ($path !== $url) {
        $img->image_url = $path;
        $img->save();
        echo "Updated {$img->id} -> {$img->image_url}\n";
    } else {
        echo "Skipped {$img->id} (no change)\n";
    }
}
