<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard stats (Admin only)
     */
    public function stats(Request $request)
    {
        $this->authorize('dashboard');

        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();
        $thisYear = now()->startOfYear();

        // Total revenue
        $totalRevenue = Order::where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                            ->sum('total');

        // Today's revenue
        $todayRevenue = Order::where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                            ->where('created_at', '>=', $today)
                            ->sum('total');

        // Month revenue
        $monthRevenue = Order::where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                            ->where('created_at', '>=', $thisMonth)
                            ->sum('total');

        // Total orders
        $totalOrders = Order::count();
        $todayOrders = Order::where('created_at', '>=', $today)->count();
        $monthOrders = Order::where('created_at', '>=', $thisMonth)->count();

        // Total products
        $totalProducts = Product::count();

        // Stock bajo basado en el mínimo designado en cada producto
        $lowStockProducts = Product::where('minimum_stock', '>', 0)
                                   ->whereRaw('stock_quantity <= minimum_stock')
                                   ->count();

        // Total customers
        $totalCustomers = User::where('role', User::ROLE_CUSTOMER)->count();
        $newCustomersMonth = User::where('role', User::ROLE_CUSTOMER)
                                 ->where('created_at', '>=', $thisMonth)
                                 ->count();

        // Status counts
        $statusCounts = Order::select('status', DB::raw('count(*) as total'))
                            ->groupBy('status')
                            ->pluck('total', 'status')
                            ->all();

        return response()->json([
            'revenue' => [
                'total' => $totalRevenue,
                'today' => $todayRevenue,
                'month' => $monthRevenue,
            ],
            'orders' => [
                'total' => $totalOrders,
                'today' => $todayOrders,
                'month' => $monthOrders,
                'by_status' => $statusCounts,
            ],
            'products' => [
                'total' => $totalProducts,
                'low_stock' => $lowStockProducts,
            ],
            'customers' => [
                'total' => $totalCustomers,
                'new_this_month' => $newCustomersMonth,
            ],
        ]);
    }

    /**
     * Get revenue chart data
     */
    public function revenueChart(Request $request)
    {
        $this->authorize('dashboard');

        $period = $request->get('period', 'month'); // day, month, year
        $days = $period === 'day' ? 30 : ($period === 'month' ? 12 : 12);

        if ($period === 'day') {
            $data = Order::where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                        ->where('created_at', '>=', now()->subDays(30))
                        ->selectRaw('DATE(created_at) as date, SUM(total) as total')
                        ->groupBy('date')
                        ->orderBy('date')
                        ->get();

            return response()->json($data);
        }

        $data = Order::where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                    ->selectRaw('MONTH(created_at) as month, SUM(total) as total')
                    ->groupBy('month')
                    ->orderBy('month')
                    ->get();

        return response()->json($data);
    }

    /**
     * Get top products
     */
    public function topProducts(Request $request)
    {
        $this->authorize('dashboard');

        $limit = $request->get('limit', 10);

        $products = OrderItem::selectRaw('product_id, SUM(quantity) as total_sold, SUM(subtotal) as total_revenue')
                            ->groupBy('product_id')
                            ->orderByRaw('total_sold DESC')
                            ->limit($limit)
                            ->with('product')
                            ->get();

        return response()->json($products);
    }

    /**
     * Get low stock products
     */
    public function lowStockProducts(Request $request)
    {
        $this->authorize('dashboard');

        // Ajustado para usar el mínimo designado en cada producto
        $products = Product::where('minimum_stock', '>', 0)
                          ->whereRaw('stock_quantity <= minimum_stock')
                          ->orderBy('stock_quantity')
                          ->paginate(20);

        return response()->json($products);
    }

    /**
     * Get top customers
     */
    public function topCustomers(Request $request)
    {
        $this->authorize('dashboard');

        $limit = $request->get('limit', 10);

        $customers = Order::selectRaw('user_id, COUNT(*) as total_orders, SUM(total) as total_spent')
                         ->where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                         ->groupBy('user_id')
                         ->orderByRaw('total_spent DESC')
                         ->limit($limit)
                         ->with('user')
                         ->get();

        return response()->json($customers);
    }

    /**
     * Get order status breakdown
     */
    public function orderStatusBreakdown(Request $request)
    {
        $this->authorize('dashboard');

        $breakdown = Order::selectRaw('status, COUNT(*) as count')
                         ->groupBy('status')
                         ->get();

        return response()->json($breakdown);
    }

    /**
     * Get recent orders
     */
    public function recentOrders(Request $request)
    {
        $this->authorize('dashboard');

        $orders = Order::with(['user'])
                      ->latest()
                      ->limit(5)
                      ->get();

        return response()->json($orders);
    }

    /**
     * Get payment method breakdown
     */
    public function paymentMethodBreakdown(Request $request)
    {
        $this->authorize('dashboard');

        $breakdown = Order::selectRaw('payment_method, COUNT(*) as count, SUM(total) as total')
                         ->groupBy('payment_method')
                         ->get();

        return response()->json($breakdown);
    }
}
