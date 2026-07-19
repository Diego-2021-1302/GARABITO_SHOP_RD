<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $isAdmin = $request->has('all') && $request->all == 'true';
        $cacheKey = $isAdmin ? 'categories_admin_v1' : 'categories_public_v1';

        $categories = Cache::remember($cacheKey, 3600, function() use ($isAdmin) {
            if ($isAdmin) {
                return Category::withCount(['products'])->get();
            } else {
                return Category::whereHas('products', function ($query) {
                    $query->where('is_active', true)
                          ->where('stock_quantity', '>', 0);
                })->withCount(['products' => function ($query) {
                    $query->where('is_active', true)
                          ->where('stock_quantity', '>', 0);
                }])->get();
            }
        });

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
        ], [
            'name.unique' => 'Esta categoría ya existe.'
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        $category = Category::create($validated);

        Cache::forget('categories_admin_v1');
        Cache::forget('categories_public_v1');

        return response()->json($category, 201);
    }

    public function destroy(int|string $id)
    {
        $category = Category::findOrFail($id);

        // Verificamos si realmente existen productos asociados antes de borrar
        $count = $category->products()->count();

        if ($count > 0) {
            return response()->json([
                'message' => "No se puede eliminar. Aún hay {$count} producto(s) asignado(s) a esta categoría. Por favor, cámbialos de categoría primero."
            ], 400);
        }

        $category->delete();

        Cache::forget('categories_admin_v1');
        Cache::forget('categories_public_v1');

        return response()->json(['message' => 'Categoría eliminada correctamente.']);
    }
}
