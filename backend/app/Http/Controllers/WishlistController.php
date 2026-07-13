<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Get user wishlist
     */
    public function index(Request $request)
    {
        $wishlist = $request->user()->wishlist ?? Wishlist::create(['user_id' => $request->user()->id]);
        
        $wishlist->load('products');

        return response()->json($wishlist);
    }

    /**
     * Add product to wishlist
     */
    public function addProduct(Request $request, int|string $productId)
    {
        $productId = $productId ?: $request->input('product_id');

        if (! $productId) {
            return response()->json(['message' => 'Product ID is required'], 400);
        }

        $request->validate([
            'product_id' => 'sometimes|exists:products,id',
        ]);

        $wishlist = $request->user()->wishlist ?? Wishlist::create(['user_id' => $request->user()->id]);

        $wishlist->products()->syncWithoutDetaching([$productId]);

        return response()->json(['message' => 'Product added to wishlist']);
    }

    /**
     * Remove product from wishlist
     */
    public function removeProduct(Request $request, int|string $productId)
    {
        $wishlist = $request->user()->wishlist;

        if (!$wishlist) {
            return response()->json(['message' => 'Wishlist not found'], 404);
        }

        $wishlist->products()->detach($productId);

        return response()->json(['message' => 'Product removed from wishlist']);
    }

    /**
     * Check if product is in wishlist
     */
    public function isInWishlist(Request $request, int|string $productId)
    {
        $wishlist = $request->user()->wishlist;

        if (!$wishlist) {
            return response()->json(['in_wishlist' => false]);
        }

        $inWishlist = $wishlist->products()->where('product_id', $productId)->exists();

        return response()->json(['in_wishlist' => $inWishlist]);
    }
}
