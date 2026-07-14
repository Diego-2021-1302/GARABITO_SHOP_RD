<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Listado de productos con filtros inteligentes
     */
    public function index(Request $request)
    {
        try {
            $isAdmin = $request->has('admin') && ($request->admin === 'true' || $request->admin === true);

            $query = Product::with(['category', 'brandRelation', 'images', 'mainProvider']);

            if (!$isAdmin) {
                // VISTA CLIENTE: Solo activos y con STOCK DISPONIBLE real (Total - Reservado)
                $query->where('is_active', true)
                      ->where('available_stock', '>', 0);
            }

            // Filtro por categoría
            if ($request->filled('category_id')) {
                $query->where('category_id', $request->category_id);
            } elseif ($request->filled('category') && $request->category !== 'Todos') {
                $category = $request->category;
                $query->whereHas('category', function ($q) use ($category) {
                    if (is_numeric($category)) {
                        $q->where('id', $category);
                    } else {
                        $q->where('slug', $category)->orWhere('name', $category);
                    }
                });
            }

            // Filtro por marca (ID o Nombre)
            if ($request->filled('brand_id')) {
                $query->where('brand_id', $request->brand_id);
            }

            if ($request->filled('brand')) {
                $brands = is_array($request->brand) ? $request->brand : explode(',', $request->brand);
                $query->where(function($q) use ($brands) {
                    $q->whereIn('brand', $brands)
                      ->orWhereHas('brandRelation', function($sq) use ($brands) {
                          $sq->whereIn('name', $brands);
                      });
                });
            }

            // Filtro por rango de precio
            if ($request->filled('minPrice')) {
                $query->where('price', '>=', $request->minPrice);
            }
            if ($request->filled('maxPrice')) {
                $query->where('price', '<=', $request->maxPrice);
            }

            // Búsqueda inteligente (Compatible con Postgres ILIKE)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';

                    $q->where('name', $like, '%' . $search . '%')
                      ->orWhere('sku', $like, '%' . $search . '%')
                      ->orWhere('barcode', $like, '%' . $search . '%')
                      ->orWhere('internal_code', $like, '%' . $search . '%');

                    if (is_numeric($search)) {
                        $q->orWhere('id', $search);
                    }
                });
            }

            // Ordenamiento
            $sort = $request->get('sort', 'nuevo');
            switch ($sort) {
                case 'precio-bajo': $query->orderBy('price', 'asc'); break;
                case 'precio-alto': $query->orderBy('price', 'desc'); break;
                case 'valoracion': $query->orderBy('rating', 'desc'); break;
                default: $query->orderBy('created_at', 'desc'); break;
            }

            $products = $query->paginate($request->get('per_page', 50));

            return ProductResource::collection($products);
        } catch (\Exception $e) {
            Log::error("Error en ProductController@index: " . $e->getMessage());
            return response()->json([
                'error' => 'Error al cargar productos',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener marcas únicas
     */
    public function brands()
    {
        $brands = Product::where('is_active', true)
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->select('brand')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        return response()->json($brands);
    }

    /**
     * Productos destacados
     */
    public function featured()
    {
        $products = Product::where('is_active', true)
            ->where('available_stock', '>', 0) // También aquí
            ->where('featured', true)
            ->with(['category', 'brandRelation', 'images', 'mainProvider'])
            ->orderBy('updated_at', 'desc')
            ->limit(12)
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * Detalle de un producto
     */
    public function show(int|string $id)
    {
        try {
            $query = Product::with(['images', 'variants', 'reviews.user', 'category', 'brandRelation', 'mainProvider']);

            if (is_numeric($id)) {
                $query->where('id', $id);
            } else {
                $query->where('slug', $id);
            }

            $product = $query->firstOrFail();

            return new ProductResource($product);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Producto no encontrado'], 404);
        }
    }

    /**
     * Crear producto
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'brand_id' => 'nullable|exists:brands,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'sku' => 'required|string|max:255|unique:products,sku',
            'barcode' => 'nullable|string|max:255',
            'internal_code' => 'nullable|string|max:255',
            'unit_of_measurement' => 'nullable|string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'main_provider_id' => 'nullable|exists:providers,id',
            'is_active' => 'sometimes|boolean',
            'featured' => 'sometimes|boolean',
            'is_new' => 'sometimes|boolean',
            'warranty' => 'nullable|string|max:255',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $validated['stock_quantity'] = 0;
        $validated['available_stock'] = 0;
        $validated['reserved_stock'] = 0;

        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                if (!$file->isValid()) continue;
                $path = $file->store('products', 'public');
                $url = Storage::url($path);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => parse_url($url, PHP_URL_PATH) ?: $url,
                    'alt_text' => $product->name,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return new ProductResource($product->load(['category', 'brandRelation', 'images', 'mainProvider']));
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, int|string $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'brand' => 'sometimes|nullable|string|max:255',
            'brand_id' => 'sometimes|nullable|exists:brands,id',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'sometimes|nullable|numeric|min:0',
            'cost' => 'sometimes|nullable|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'sku' => 'sometimes|string|max:255|unique:products,sku,' . $id,
            'barcode' => 'sometimes|nullable|string|max:255',
            'internal_code' => 'sometimes|nullable|string|max:255',
            'unit_of_measurement' => 'sometimes|nullable|string|max:50',
            'weight' => 'sometimes|nullable|numeric|min:0',
            'location' => 'sometimes|nullable|string|max:255',
            'minimum_stock' => 'sometimes|nullable|integer|min:0',
            'maximum_stock' => 'sometimes|nullable|integer|min:0',
            'main_provider_id' => 'nullable|exists:providers,id',
            'is_active' => 'sometimes|boolean',
            'featured' => 'sometimes|boolean',
            'is_new' => 'sometimes|boolean',
            'warranty' => 'nullable|string|max:255',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                if (!$file->isValid()) continue;
                $path = $file->store('products', 'public');
                $url = Storage::url($path);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_url' => parse_url($url, PHP_URL_PATH) ?: $url,
                    'alt_text' => $product->name,
                    'sort_order' => $index,
                    'is_primary' => false,
                ]);
            }
        }

        return new ProductResource($product->load(['category', 'brandRelation', 'images', 'mainProvider']));
    }

    /**
     * Eliminación
     */
    public function destroy(int|string $id)
    {
        return DB::transaction(function () use ($id) {
            $product = Product::findOrFail($id);

            foreach ($product->images as $img) {
                if ($img->image_url && !str_starts_with($img->image_url, 'http')) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $img->image_url));
                }
            }

            $product->images()->delete();
            $product->delete();

            return response()->json(['message' => 'Producto eliminado permanentemente']);
        });
    }
}
