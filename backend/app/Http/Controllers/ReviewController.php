<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Get product reviews
     */
    public function index(int|string $productId)
    {
        $reviews = Review::where('product_id', $productId)
                        ->with('user')
                        ->latest()
                        ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Get user reviews
     */
    public function userReviews(Request $request)
    {
        $reviews = $request->user()->reviews()
                          ->with('product')
                          ->latest()
                          ->paginate(10);

        return response()->json($reviews);
    }

    /**
     * Create review
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'required|string|max:255',
            'comment' => 'nullable|string',
        ]);

        // Check if user already reviewed this product
        $existingReview = Review::where('product_id', $validated['product_id'])
                               ->where('user_id', $request->user()->id)
                               ->first();

        if ($existingReview) {
            return response()->json(['message' => 'You already reviewed this product'], 400);
        }

        // Check if user purchased this product
        $purchased = \App\Models\OrderItem::whereHas('order', function ($query) {
            $query->where('user_id', Auth::id());
        })->where('product_id', $validated['product_id'])->exists();

        $review = Review::create(array_merge(
            $validated,
            [
                'user_id' => $request->user()->id,
                'is_verified_purchase' => $purchased,
            ]
        ));

        return response()->json($review, 201);
    }

    /**
     * Update review
     */
    public function update(Request $request, int|string $id)
    {
        $review = Review::findOrFail($id);

        if ($review->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'title' => 'sometimes|string|max:255',
            'comment' => 'sometimes|string',
        ]);

        $review->update($validated);

        return response()->json($review);
    }

    /**
     * Delete review
     */
    public function destroy(Request $request, int|string $id)
    {
        $review = Review::findOrFail($id);

        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }

    /**
     * Mark review as helpful/unhelpful
     */
    public function markHelpful(Request $request, int|string $id)
    {
        $review = Review::findOrFail($id);

        $validated = $request->validate([
            'helpful' => 'required|boolean',
        ]);

        if ($validated['helpful']) {
            $review->increment('helpful_count');
        } else {
            $review->increment('unhelpful_count');
        }

        return response()->json(['message' => 'Thanks for your feedback']);
    }
}
