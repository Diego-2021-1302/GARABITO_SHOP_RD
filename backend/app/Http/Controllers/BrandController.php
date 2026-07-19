<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function index(Request $request)
    {
        $all = $request->has('all');
        $cacheKey = 'brands_' . ($all ? 'all' : 'page_' . $request->get('page', 1));

        return Cache::remember($cacheKey, 3600, function() use ($all, $request) {
            $query = Brand::query();
            if ($all) {
                return $query->orderBy('name')->get();
            }
            return $query->orderBy('name')->paginate($request->get('per_page', 20));
        });
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

        // Limpiar caches de marcas (forma simple: el administrador no las cambia cada segundo)
        Cache::flush();

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

        Cache::flush();

        return response()->json($brand);
    }

    public function destroy(Brand $brand)
    {
        $brand->delete();
        Cache::flush();
        return response()->json(['message' => 'Marca eliminada con éxito']);
    }
}
