<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerController extends Controller
{
    /**
     * List all customers with stats
     */
    public function index(Request $request)
    {
        $query = User::where('role', User::ROLE_CUSTOMER);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->withCount('orders')
            ->latest()
            ->paginate(20);

        return response()->json($customers);
    }

    /**
     * Get customer details and stats
     */
    public function show($id)
    {
        $customer = User::where('role', User::ROLE_CUSTOMER)
            ->with(['addresses'])
            ->findOrFail($id);

        // Stats
        $totalSpent = Order::where('user_id', $id)
            ->where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
            ->sum('total');

        $activeOrders = Order::where('user_id', $id)
            ->whereNotIn('status', [Order::STATUS_DELIVERED, Order::STATUS_CANCELLED])
            ->count();

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'role' => $customer->role,
            'created_at' => $customer->created_at,
            'is_active' => $customer->is_active,
            'addresses' => $customer->addresses,
            'total_spent' => $totalSpent,
            'active_orders_count' => $activeOrders,
            'orders_count' => $customer->orders()->count(),
        ]);
    }
}
