<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get cart from session
     */
    public function getCart(Request $request)
    {
        $cart = $request->session()->get('cart', []);

        $cartWithDetails = [];
        $total = 0;

        foreach ($cart as $item) {
            $product = Product::find($item['product_id']);
            if ($product) {
                $itemTotal = $product->price * $item['quantity'];
                $cartWithDetails[] = [
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'total' => $itemTotal,
                ];
                $total += $itemTotal;
            }
        }

        return response()->json([
            'items' => $cartWithDetails,
            'subtotal' => $total,
            'itbis' => 0, // Impuesto desactivado por el usuario
            'total' => $total,
        ]);
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $cart = $request->session()->get('cart', []);
        $key = $validated['product_id'] . '-' . ($validated['variant_id'] ?? 'none');

        if (isset($cart[$key])) {
            $cart[$key]['quantity'] += $validated['quantity'];
        } else {
            $cart[$key] = $validated;
        }

        $request->session()->put('cart', $cart);

        return response()->json(['message' => 'Item added to cart']);
    }

    /**
     * Update cart item
     */
    public function updateItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $cart = $request->session()->get('cart', []);
        $key = $validated['product_id'] . '-' . ($validated['variant_id'] ?? 'none');

        if (isset($cart[$key])) {
            $cart[$key]['quantity'] = $validated['quantity'];
        }

        $request->session()->put('cart', $cart);

        return response()->json(['message' => 'Item updated']);
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $cart = $request->session()->get('cart', []);
        $key = $validated['product_id'] . '-' . ($validated['variant_id'] ?? 'none');

        unset($cart[$key]);

        $request->session()->put('cart', $cart);

        return response()->json(['message' => 'Item removed from cart']);
    }

    /**
     * Clear cart
     */
    public function clearCart(Request $request)
    {
        $request->session()->forget('cart');

        return response()->json(['message' => 'Cart cleared']);
    }
}
