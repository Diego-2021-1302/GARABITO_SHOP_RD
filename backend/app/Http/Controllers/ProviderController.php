<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProviderController extends Controller
{
    public function index(Request $request)
    {
        $query = Provider::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('commercial_name', 'like', "%$search%")
                  ->orWhere('company_name', 'like', "%$search%")
                  ->orWhere('rnc', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'commercial_name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'rnc' => 'required|string|unique:providers,rnc',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|unique:providers,email',
            'address' => 'required|string',
            'contact_person' => 'required|string|max:255',
            'is_active' => 'boolean',
            'payment_terms_days' => 'nullable|integer|min:0',
            'payment_conditions' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'outstanding_balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
        }

        $provider = Provider::create($validated);

        return response()->json($provider, 201);
    }

    public function show(Provider $provider)
    {
        return response()->json($provider);
    }

    public function update(Request $request, Provider $provider)
    {
        $validated = $request->validate([
            'commercial_name' => 'sometimes|required|string|max:255',
            'company_name' => 'sometimes|required|string|max:255',
            'rnc' => ['sometimes', 'required', 'string', Rule::unique('providers')->ignore($provider->id)],
            'phone' => 'sometimes|required|string|max:20',
            'email' => ['sometimes', 'required', 'email', Rule::unique('providers')->ignore($provider->id)],
            'address' => 'sometimes|required|string',
            'contact_person' => 'sometimes|required|string|max:255',
            'is_active' => 'boolean',
            'payment_terms_days' => 'nullable|integer|min:0',
            'payment_conditions' => 'nullable|string|max:255',
            'credit_limit' => 'nullable|numeric|min:0',
            'outstanding_balance' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['status'])) {
            $validated['is_active'] = $validated['status'] === 'active';
        }

        $provider->update($validated);

        return response()->json($provider);
    }

    public function destroy(Provider $provider)
    {
        $provider->delete();
        return response()->json(null, 204);
    }
}
