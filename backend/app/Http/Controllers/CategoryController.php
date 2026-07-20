<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            if (!Schema::hasTable('categories')) {
                return response()->json([]);
            }

            $isAdmin = $request->has('all') && $request->all == 'true';

            if ($isAdmin) {
                return response()->json(Category::withCount(['products'])->orderBy('name')->get());
            } else {
                return response()->json(Category::whereHas('products', function ($query) {
                    $query->where('is_active', true)
                          ->where('stock_quantity', '>', 0);
                })->withCount(['products' => function ($query) {
                    $query->where('is_active', true)
                          ->where('stock_quantity', '>', 0);
                }])->orderBy('name')->get());
            }
        } catch (\Exception $e) {
            Log::error("Error in CategoryController@index: " . $e->getMessage());
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:categories',
                'description' => 'nullable|string',
            ], [
                'name.unique' => 'Esta categoría ya existe.'
            ]);

            $validated['slug'] = Str::slug($validated['name']);
            $category = Category::create($validated);

            return response()->json($category, 201);
        } catch (\Exception $e) {
            Log::error("Error in CategoryController@store: " . $e->getMessage());
            return response()->json(['error' => 'Error al crear la categoría'], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::findOrFail($id);
            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Categoría no encontrada'], 404);
        }
    }

    public function destroy(int|string $id)
    {
        try {
            $category = Category::findOrFail($id);

            // Verificamos si realmente existen productos asociados antes de borrar
            $count = $category->products()->count();

            if ($count > 0) {
                return response()->json([
                    'message' => "No se puede eliminar. Aún hay {$count} producto(s) asignado(s) a esta categoría. Por favor, cámbialos de categoría primero."
                ], 400);
            }

            $category->delete();

            return response()->json(['message' => 'Categoría eliminada correctamente.']);
        } catch (\Exception $e) {
            Log::error("Error in CategoryController@destroy: " . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar la categoría'], 500);
        }
    }
}
