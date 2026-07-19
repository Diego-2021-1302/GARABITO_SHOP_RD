<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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
            if (!\Schema::hasTable('brands')) {
                return response()->json([]);
            }
            $brands = Brand::all();
            return response()->json($brands);
        } catch (\Exception $e) {
            Log::error("Error in BrandController@index: " . $e->getMessage());
            return response()->json([], 200);
        }
    }

    public function store(Request $request)
    {
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
    }

    public function show(Brand $brand)
    {
        return response()->json($brand);
    }

    public function update(Request $request, Brand $brand)
    {
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
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        return response()->json(['message' => 'Marca eliminada con éxito']);
    }
}
