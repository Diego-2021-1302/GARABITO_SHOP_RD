<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\Cloudinary\CloudinaryService;
use App\Http\Resources\ProductResource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

class ProductController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * Listado de productos con filtros inteligentes
     */
    public function index(Request $request)
    {
        try {
            if (!Schema::hasTable('products')) {
                return response()->json(['data' => [], 'meta' => ['total' => 0]], 200);
            }

            $isAdmin = $request->has('admin') && ($request->admin === 'true' || $request->admin === true);

            $query = Product::with(['category', 'brandRelation', 'primaryImage', 'mainProvider']);

            if (!$isAdmin) {
                $query->where('is_active', true);
            }

            // Búsqueda
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
                    $q->where('name', $like, '%' . $search . '%')
                      ->orWhere('sku', $like, '%' . $search . '%')
                      ->orWhere('barcode', $like, '%' . $search . '%')
                      ->orWhere('internal_code', $like, '%' . $search . '%');
                });
            }

            // Filtros básicos
            if ($request->filled('category')) {
                $category = $request->category;
                if ($category !== 'Todos') {
                    $query->whereHas('category', function ($q) use ($category) {
                        $q->where('name', $category)->orWhere('slug', $category);
                    });
                }
            }

            // Filtro por marca
            if ($request->filled('brand')) {
                $brands = $request->brand;
                if (is_array($brands)) {
                    $query->whereIn('brand', $brands);
                } else {
                    $query->where('brand', $brands);
                }
            }

            // Ordenamiento por defecto: Precio Ascendente si no se especifica
            $sort = $request->get('sort', 'price_asc');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'newest':
                    $query->latest();
                    break;
                default:
                    $query->latest();
                    break;
            }

            $products = $query->paginate($request->get('per_page', 24));

            return ProductResource::collection($products);
        } catch (\Exception $e) {
            Log::error("Error en ProductController@index: " . $e->getMessage());
            return response()->json(['error' => 'Error al cargar productos', 'details' => $e->getMessage()], 500);
        }
    }

    /**
     * Detalle de un producto
     */
    public function show(int|string $id)
    {
        try {
            $query = Product::with(['images', 'variants', 'reviews.user', 'category', 'brandRelation', 'mainProvider']);
            $product = is_numeric($id) ? $query->findOrFail($id) : $query->where('slug', $id)->firstOrFail();
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
        try {
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

            $product = Product::create($validated);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    if (!$file->isValid()) continue;

                    // Subir a Cloudinary
                    try {
                        $imageUrl = $this->cloudinary->upload($file, 'products');

                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_url' => $imageUrl,
                            'alt_text' => $product->name,
                            'sort_order' => $index,
                            'is_primary' => $index === 0,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Error subiendo imagen a Cloudinary: " . $e->getMessage());
                    }
                }
            }

            return new ProductResource($product->load(['category', 'brandRelation', 'images', 'mainProvider']));
        } catch (\Exception $e) {
            Log::error("Error in ProductController@store: " . $e->getMessage());
            return response()->json(['error' => 'Error al crear el producto'], 500);
        }
    }

    /**
     * Actualizar producto
     */
    public function update(Request $request, int|string $id)
    {
        try {
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

                    try {
                        $imageUrl = $this->cloudinary->upload($file, 'products');
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_url' => $imageUrl,
                            'alt_text' => $product->name,
                            'sort_order' => $index,
                            'is_primary' => false,
                        ]);
                    } catch (\Exception $e) {
                        Log::error("Error subiendo imagen a Cloudinary: " . $e->getMessage());
                    }
                }
            }

            return new ProductResource($product->load(['category', 'brandRelation', 'images', 'mainProvider']));
        } catch (\Exception $e) {
            Log::error("Error in ProductController@update: " . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar el producto'], 500);
        }
    }

    /**
     * Eliminación
     */
    public function destroy(int|string $id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $product = Product::findOrFail($id);
                $product->images()->delete();
                $product->delete();

                return response()->json(['message' => 'Producto eliminado permanentemente']);
            });
        } catch (\Exception $e) {
            Log::error("Error in ProductController@destroy: " . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar el producto'], 500);
        }
    }

    public function brands()
    {
        try {
            if (!Schema::hasTable('products')) {
                return response()->json([]);
            }
            $brands = Product::where('is_active', true)
                ->whereNotNull('brand')
                ->where('brand', '!=', '')
                ->select('brand')
                ->distinct()
                ->orderBy('brand')
                ->pluck('brand');
            return response()->json($brands);
        } catch (\Exception $e) {
            return response()->json([], 200);
        }
    }

    public function featured()
    {
        try {
            if (!Schema::hasTable('products')) {
                return response()->json([]);
            }
            $products = Product::where('is_active', true)
                ->where('featured', true)
                ->with(['category', 'brandRelation', 'primaryImage', 'mainProvider'])
                ->orderBy('updated_at', 'desc')
                ->limit(12)
                ->get();

            return ProductResource::collection($products);
        } catch (\Exception $e) {
            Log::error("Error in ProductController@featured: " . $e->getMessage());
            return response()->json([], 200);
        }
    }
}
