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
            $isAdmin = $request->has('admin') && ($request->admin === 'true' || $request->admin === true);

            $query = Product::with(['category', 'brandRelation', 'images', 'mainProvider']);

            if (!$isAdmin) {
                $query->where('is_active', true);
            }

            // Búsqueda
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $like = DB::getDriverName() === 'pgsql' ? 'ilike' : 'like';
                    $q->where('name', $like, '%' . $search . '%')
                      ->orWhere('sku', $like, '%' . $search . '%');
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

            $products = $query->latest()->paginate($request->get('per_page', 50));

            return ProductResource::collection($products);
        } catch (\Exception $e) {
            Log::error("Error en ProductController@index: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
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
    }

    /**
     * Eliminación
     */
    public function destroy(int|string $id)
    {
        return DB::transaction(function () use ($id) {
            $product = Product::findOrFail($id);
            // Nota: Aquí podrías añadir lógica para borrar de Cloudinary si guardas el public_id
            $product->images()->delete();
            $product->delete();
            return response()->json(['message' => 'Producto eliminado permanentemente']);
        });
    }

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

    public function featured()
    {
        $products = Product::where('is_active', true)
            ->where('featured', true)
            ->with(['category', 'brandRelation', 'images', 'mainProvider'])
            ->orderBy('updated_at', 'desc')
            ->limit(12)
            ->get();
        return ProductResource::collection($products);
    }
}
