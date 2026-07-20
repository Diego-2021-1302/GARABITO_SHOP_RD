<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    /**
     * Get cart for current user
     */
    public function getCart(Request $request)
    {
        try {
            $userId = Auth::id();
            $cartItems = CartItem::where('user_id', $userId)
                ->with(['product.images', 'product.category', 'variant'])
                ->get();

            $itemsWithDetails = [];
            $total = 0;

            foreach ($cartItems as $item) {
                $product = $item->product;
                if ($product) {
                    $price = $product->discount_price ?? $product->price;
                    $itemTotal = (float)$price * $item->quantity;

                    // Get image URL
                    $image = null;
                    if ($product->images->count() > 0) {
                        $image = $product->images->first()->image_url;
                    }

                    $itemsWithDetails[] = [
                        'id' => $product->id,
                        'cart_item_id' => $item->id,
                        'variant_id' => $item->variant_id,
                        'name' => $product->name,
                        'price' => (float)$product->price,
                        'discountPrice' => $product->discount_price ? (float)$product->discount_price : null,
                        'images' => $product->images->count() > 0 ? $product->images->pluck('image_url')->toArray() : [],
                        'image' => $image,
                        'brand' => $product->brand,
                        'category' => $product->category ? $product->category->name : 'Hardware',
                        'quantity' => $item->quantity,
                        'stock' => $product->stock_quantity,
                        'total' => $itemTotal,
                    ];
                    $total += $itemTotal;
                }
            }

            return response()->json([
                'items' => $itemsWithDetails,
                'subtotal' => $total,
                'total' => $total,
            ]);
        } catch (\Exception $e) {
            Log::error("Error in getCart: " . $e->getMessage());
            return response()->json(['error' => 'Error al obtener el carrito'], 500);
        }
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
                'variant_id' => 'nullable|exists:product_variants,id',
            ]);

            $userId = Auth::id();
            $product = Product::findOrFail($validated['product_id']);

            // Buscar si ya existe en el carrito
            $cartItem = CartItem::where('user_id', $userId)
                ->where('product_id', $validated['product_id'])
                ->where('variant_id', $validated['variant_id'] ?? null)
                ->first();

            $currentQuantity = $cartItem ? $cartItem->quantity : 0;
            $newTotalQuantity = $currentQuantity + $validated['quantity'];

            // VALIDACIÓN DE STOCK
            if ($newTotalQuantity > $product->stock_quantity) {
                return response()->json([
                    'message' => "Stock insuficiente. Solo quedan {$product->stock_quantity} unidades disponibles.",
                    'available_stock' => $product->stock_quantity
                ], 422);
            }

            if ($cartItem) {
                $cartItem->increment('quantity', $validated['quantity']);
            } else {
                $cartItem = CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $validated['product_id'],
                    'variant_id' => $validated['variant_id'] ?? null,
                    'quantity' => $validated['quantity'],
                ]);
            }

            return $this->getCart($request);
        } catch (\Exception $e) {
            Log::error("Error in addItem: " . $e->getMessage());
            return response()->json(['error' => 'Error al añadir al carrito'], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:0',
                'variant_id' => 'nullable|exists:product_variants,id',
            ]);

            $userId = Auth::id();
            $product = Product::findOrFail($validated['product_id']);

            // VALIDACIÓN DE STOCK
            if ($validated['quantity'] > $product->stock_quantity) {
                return response()->json([
                    'message' => "No puedes agregar más de {$product->stock_quantity} unidades (límite de stock).",
                    'available_stock' => $product->stock_quantity
                ], 422);
            }

            if ($validated['quantity'] <= 0) {
                CartItem::where('user_id', $userId)
                    ->where('product_id', $validated['product_id'])
                    ->where('variant_id', $validated['variant_id'] ?? null)
                    ->delete();
            } else {
                CartItem::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'product_id' => $validated['product_id'],
                        'variant_id' => $validated['variant_id'] ?? null,
                    ],
                    ['quantity' => $validated['quantity']]
                );
            }

            return $this->getCart($request);
        } catch (\Exception $e) {
            Log::error("Error in updateItem: " . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar el carrito'], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request)
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'variant_id' => 'nullable|exists:product_variants,id',
            ]);

            CartItem::where('user_id', Auth::id())
                ->where('product_id', $validated['product_id'])
                ->where('variant_id', $validated['variant_id'] ?? null)
                ->delete();

            return $this->getCart($request);
        } catch (\Exception $e) {
            Log::error("Error in removeItem: " . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar del carrito'], 500);
        }
    }

    /**
     * Clear cart
     */
    public function clearCart(Request $request)
    {
        try {
            CartItem::where('user_id', Auth::id())->delete();
            return response()->json([
                'items' => [],
                'subtotal' => 0,
                'total' => 0,
            ]);
        } catch (\Exception $e) {
            Log::error("Error in clearCart: " . $e->getMessage());
            return response()->json(['error' => 'Error al vaciar el carrito'], 500);
        }
    }
}
