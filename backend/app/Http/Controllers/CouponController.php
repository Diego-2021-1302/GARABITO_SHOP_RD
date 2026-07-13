<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * Validate coupon code
     */
    public function validateCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($validated['code']))->first();

        if (!$coupon) {
            return response()->json(['message' => 'Coupon code not found'], 404);
        }

        if (!$coupon->isValid()) {
            return response()->json(['message' => 'Coupon is invalid or expired'], 400);
        }

        // Check minimum purchase amount
        if ($coupon->min_purchase_amount && $validated['subtotal'] < $coupon->min_purchase_amount) {
            return response()->json([
                'message' => 'Purchase amount is below minimum required',
                'min_amount' => $coupon->min_purchase_amount,
            ], 400);
        }

        // Calculate discount
        $discount = 0;
        if ($coupon->discount_type === 'percentage') {
            $discount = $validated['subtotal'] * ($coupon->discount_value / 100);
        } else {
            $discount = $coupon->discount_value;
        }

        return response()->json([
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $discount,
            'new_subtotal' => $validated['subtotal'] - $discount,
        ]);
    }

    /**
     * Get all coupons (Admin only)
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Coupon::class);

        $coupons = Coupon::latest()->paginate(10);

        return response()->json($coupons);
    }

    /**
     * Create coupon (Admin only)
     */
    public function store(Request $request)
    {
        $this->authorize('create', Coupon::class);

        $validated = $request->validate([
            'code' => 'required|string|unique:coupons',
            'description' => 'nullable|string',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_purchase_amount' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:1',
            'max_uses_per_user' => 'integer|min:1|default:1',
            'is_active' => 'boolean',
            'expires_at' => 'nullable|date',
        ]);

        $coupon = Coupon::create(array_merge(
            $validated,
            ['code' => strtoupper($validated['code'])]
        ));

        return response()->json($coupon, 201);
    }

    /**
     * Update coupon (Admin only)
     */
    public function update(Request $request, int|string $id)
    {
        $coupon = Coupon::findOrFail($id);
        $this->authorize('update', $coupon);

        $validated = $request->validate([
            'code' => 'sometimes|string|unique:coupons,code,' . $id,
            'description' => 'sometimes|string',
            'discount_type' => 'sometimes|in:percentage,fixed',
            'discount_value' => 'sometimes|numeric|min:0',
            'min_purchase_amount' => 'sometimes|nullable|numeric|min:0',
            'max_uses' => 'sometimes|nullable|integer|min:1',
            'max_uses_per_user' => 'sometimes|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'expires_at' => 'sometimes|nullable|date',
        ]);

        if (isset($validated['code'])) {
            $validated['code'] = strtoupper($validated['code']);
        }

        $coupon->update($validated);

        return response()->json($coupon);
    }

    /**
     * Delete coupon (Admin only)
     */
    public function destroy(Request $request, int|string $id)
    {
        $coupon = Coupon::findOrFail($id);
        $this->authorize('delete', $coupon);

        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted successfully']);
    }
}
