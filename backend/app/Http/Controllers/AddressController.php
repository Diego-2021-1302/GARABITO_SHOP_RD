<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    /**
     * Get all user addresses
     */
    public function index(Request $request)
    {
        return response()->json($request->user()->addresses);
    }

    /**
     * Store a new address
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'alias' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'provincia' => 'required|string|max:255',
            'municipio' => 'required|string|max:255',
            'sector' => 'required|string|max:255',
            'calle' => 'nullable|string|max:255',
            'referencia' => 'required|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'formatted_address' => 'nullable|string',
            'is_default' => 'boolean',
            'type' => 'required|in:shipping,billing',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            // If setting as default, unset others
            if ($validated['is_default'] ?? false) {
                $request->user()->addresses()->update(['is_default' => false]);
            }

            // If it's the first address, make it default
            if ($request->user()->addresses()->count() === 0) {
                $validated['is_default'] = true;
            }

            $address = $request->user()->addresses()->create($validated);
            return response()->json($address, 201);
        });
    }

    /**
     * Update an address
     */
    public function update(Request $request, int|string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'alias' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'provincia' => 'sometimes|string|max:255',
            'municipio' => 'sometimes|string|max:255',
            'sector' => 'sometimes|string|max:255',
            'calle' => 'sometimes|nullable|string|max:255',
            'referencia' => 'sometimes|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'formatted_address' => 'nullable|string',
            'is_default' => 'sometimes|boolean',
            'type' => 'sometimes|in:shipping,billing',
        ]);

        return DB::transaction(function () use ($request, $address, $validated, $id) {
            if ($validated['is_default'] ?? false) {
                $request->user()->addresses()->where('id', '!=', $id)->update(['is_default' => false]);
            }

            $address->update($validated);
            return response()->json($address);
        });
    }

    /**
     * Delete an address
     */
    public function destroy(Request $request, int|string $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);

        return DB::transaction(function () use ($request, $address, $id) {
            if ($address->is_default) {
                // Intenta asignar default a otra si existe
                $another = $request->user()->addresses()->where('id', '!=', $id)->first();
                if ($another) {
                    $another->update(['is_default' => true]);
                }
            }

            $address->delete();
            return response()->json(['message' => 'Address deleted successfully']);
        });
    }

    /**
     * Set address as default
     */
    public function setDefault(Request $request, int|string $id)
    {
        try {
            return DB::transaction(function () use ($request, $id) {
                // Ensure we only touch active addresses of the authenticated user
                $request->user()->addresses()->update(['is_default' => false]);

                $address = $request->user()->addresses()->findOrFail($id);
                $address->is_default = true;
                $address->save();

                return response()->json(['message' => 'Default address updated']);
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la dirección principal',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
