<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin y Cliente de Prueba
        User::create([
            'name' => 'Admin Garabito',
            'email' => 'admin@garabitoshop.com.do',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Juan Pérez',
            'email' => 'juan@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer',
        ]);

        // 2. Categorías Profesionales
        $categories = [
            ['name' => 'Celulares', 'icon' => 'smartphone'],
            ['name' => 'Laptops', 'icon' => 'laptop'],
            ['name' => 'Audio', 'icon' => 'headphones'],
            ['name' => 'Gaming', 'icon' => 'gamepad'],
            ['name' => 'Relojes', 'icon' => 'watch'],
            ['name' => 'Cámaras', 'icon' => 'camera'],
            ['name' => 'Monitores', 'icon' => 'monitor'],
            ['name' => 'Accesorios', 'icon' => 'speaker'],
        ];

        $brands = ['Apple', 'Samsung', 'Sony', 'Logitech', 'Keychron', 'DJI', 'Asus', 'Dell'];

        foreach ($categories as $catData) {
            $category = Category::create([
                'name' => $catData['name'],
                'slug' => Str::slug($catData['name']),
                'description' => 'Los mejores ' . $catData['name'] . ' premium en República Dominicana.',
                'is_active' => true,
            ]);

            // 3. Productos por Categoría
            for ($i = 1; $i <= 5; $i++) {
                $brand = $brands[array_rand($brands)];
                $price = rand(15, 150) * 1000;

                $product = Product::create([
                    'name' => $brand . ' ' . $catData['name'] . ' Pro Model ' . $i,
                    'slug' => Str::slug($brand . ' ' . $catData['name'] . ' Pro Model ' . $i . '-' . Str::random(4)),
                    'brand' => $brand,
                    'description' => 'Esta es una descripción detallada para el mercado de RD. Ofrecemos garantía local y soporte técnico especializado para el ' . $brand . ' ' . $catData['name'] . '.',
                    'price' => $price,
                    'discount_price' => rand(0, 1) ? $price * 0.9 : null,
                    'category_id' => $category->id,
                    'stock_quantity' => rand(5, 50),
                    'sku' => strtoupper($brand[0] . $catData['name'][0]) . '-' . rand(1000, 9999),
                    'rating' => rand(40, 50) / 10,
                    'reviews_count' => rand(10, 200),
                    'featured' => rand(0, 5) === 0, // 20% probabilidad de ser destacado
                    'is_new' => true,
                    'warranty' => '12 meses oficial',
                    'specifications' => ['Material' => 'Premium', 'Origen' => 'Global'],
                ]);

                // Imágenes (Unsplash Tech IDs)
                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => 'https://images.unsplash.com/photo-' . (1511707171634 + rand(1, 1000)) . '?w=1000&auto=format&fit=crop',
                    'is_primary' => true,
                ]);
            }
        }
    }
}
