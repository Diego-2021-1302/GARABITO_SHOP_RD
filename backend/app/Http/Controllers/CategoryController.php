<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        if ($request->has('all') && $request->all == 'true') {
            // Admin: Contamos solo productos que NO estén eliminados (por si acaso hay basura en la DB)
            $categories = Category::withCount(['products' => function($query) {
                // Aquí podrías agregar condiciones adicionales si usas SoftDeletes en Products
            }])->get();
        } else {
            // Cliente: Solo categorías con stock real
            $categories = Category::whereHas('products', function ($query) {
                $query->where('is_active', true)
                      ->where('stock_quantity', '>', 0);
            })->withCount(['products' => function ($query) {
                $query->where('is_active', true)
                      ->where('stock_quantity', '>', 0);
            }])->get();
        }

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

        return response()->json(['message' => 'Categoría eliminada correctamente.']);
    }
}
