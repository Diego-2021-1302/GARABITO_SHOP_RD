<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class BrandController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function index(Request $request)
    {
        try {
            if (!Schema::hasTable('brands')) {
                return response()->json([]);
            }
            $brands = Brand::orderBy('name')->get();
            return response()->json($brands);
        } catch (\Exception $e) {
            Log::error("Error in BrandController@index: " . $e->getMessage());
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:brands,name',
                'description' => 'nullable|string',
                'is_active' => 'boolean',
                'logo' => 'nullable|image|max:2048'
            ]);

            if ($request->hasFile('logo')) {
                $validated['logo_url'] = $this->cloudinary->upload($request->file('logo'), 'brands');
            }

            $validated['slug'] = Str::slug($validated['name']);
            $brand = Brand::create($validated);

            return response()->json($brand, 201);
        } catch (\Exception $e) {
            Log::error("Error in BrandController@store: " . $e->getMessage());
            return response()->json(['error' => 'Error al crear la marca'], 500);
        }
    }

    public function show($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            return response()->json($brand);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Marca no encontrada'], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255|unique:brands,name,' . $brand->id,
                'description' => 'nullable|string',
                'is_active' => 'boolean',
                'logo' => 'nullable|image|max:2048'
            ]);

            if ($request->hasFile('logo')) {
                $validated['logo_url'] = $this->cloudinary->upload($request->file('logo'), 'brands');
            }

            if (isset($validated['name'])) {
                $validated['slug'] = Str::slug($validated['name']);
            }

            $brand->update($validated);

            return response()->json($brand);
        } catch (\Exception $e) {
            Log::error("Error in BrandController@update: " . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar la marca'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $brand = Brand::findOrFail($id);
            $brand->delete();
            return response()->json(['message' => 'Marca eliminada con éxito']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al eliminar la marca'], 500);
        }
    }
}
