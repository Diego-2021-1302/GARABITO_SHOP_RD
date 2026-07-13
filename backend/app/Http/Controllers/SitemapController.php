<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Genera un Sitemap XML dinámico
     */
    public function index(): Response
    {
        $products = Product::where('is_active', true)->get();
        $categories = Category::all();
        $frontendUrl = config('app.frontend_url', 'https://garabitoshop.com.do');

        $xml = '<?xml version="1.0" encoding="UTF-8"?>';
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Home
        $xml .= "<url><loc>{$frontendUrl}/</loc><priority>1.0</priority></url>";

        // Catálogo
        $xml .= "<url><loc>{$frontendUrl}/catalogo</loc><priority>0.9</priority></url>";

        // Categorías
        foreach ($categories as $category) {
            $xml .= "<url>";
            $xml .= "<loc>{$frontendUrl}/catalogo?categoria=" . urlencode($category->name) . "</loc>";
            $xml .= "<lastmod>" . $category->updated_at->toAtomString() . "</lastmod>";
            $xml .= "<priority>0.8</priority>";
            $xml .= "</url>";
        }

        // Productos
        foreach ($products as $product) {
            $xml .= "<url>";
            $xml .= "<loc>{$frontendUrl}/producto/" . ($product->slug ?: $product->id) . "</loc>";
            $xml .= "<lastmod>" . $product->updated_at->toAtomString() . "</lastmod>";
            $xml .= "<priority>0.7</priority>";
            $xml .= "</url>";
        }

        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml']);
    }
}
