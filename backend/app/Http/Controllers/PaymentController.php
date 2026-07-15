<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    private PaymentService $paymentService;

    public function __construct(PaymentService $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    /**
     * Process payment for order
     */
    public function process(Request $request, int|string $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Verify user owns this order or is admin
        if ($order->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if order is already paid
        if ($order->payment_status === Order::PAYMENT_STATUS_COMPLETED) {
            return response()->json(['message' => 'Order already paid'], 400);
        }

        // Validate payment method
        if ($order->payment_method === 'cod') {
            // Contra Entrega doesn't require payment processing
            $order->update([
                'payment_status' => Order::PAYMENT_STATUS_PENDING,
                'status' => Order::STATUS_PREPARING,
            ]);

            // Descontar stock para pedidos en efectivo al confirmar preparación
            $inventoryService = app(\App\Services\Inventory\InventoryService::class);
            $inventoryService->finalizeOrderStockExit($order);

            return response()->json([
                'success' => true,
                'message' => 'Order confirmed for Cash on Delivery',
                'order' => $order,
            ]);
        }

        // Validate payment data
        $validated = $request->validate([
            'cardholder_name' => 'required|string|max:255',
            'card_number' => 'required|string|min:13|max:19',
            'expiration' => 'required|string|regex:/^\d{2}\/\d{2}$/',
            'cvv' => 'required|string|size:3|numeric',
            'email' => 'sometimes|email',
        ]);

        // Process payment
        $result = $this->paymentService->processPayment($order, $validated);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 400);
        }
    }

    /**
     * Verify payment status
     */
    public function verify(Request $request, int|string $orderId)
    {
        $order = Order::findOrFail($orderId);

        // Verify user owns this order or is admin
        if ($order->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $transaction = $order->paymentTransaction;

        if (!$transaction) {
            return response()->json(['message' => 'No payment transaction found'], 404);
        }

        $result = $this->paymentService->verifyPayment($transaction);

        return response()->json($result);
    }

    /**
     * Refund payment (Admin only)
     */
    public function refund(Request $request, int|string $orderId)
    {
        $this->authorize('refundPayment', Order::class);

        $order = Order::findOrFail($orderId);

        if ($order->payment_status !== Order::PAYMENT_STATUS_COMPLETED) {
            return response()->json(['message' => 'Order payment not completed'], 400);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $result = $this->paymentService->refundPayment($order, $validated['amount']);

        if ($result['success']) {
            return response()->json($result);
        } else {
            return response()->json($result, 400);
        }
    }

    /**
     * Get payment methods
     */
    public function getMethods()
    {
        $methods = [
            [
                'id' => 'azul',
                'name' => 'Azul Popular',
                'description' => 'Tarjeta de crédito o débito',
                'icon' => 'azul',
            ],
            [
                'id' => 'cardnet',
                'name' => 'Cardnet',
                'description' => 'Procesadora de pagos Cardnet',
                'icon' => 'cardnet',
            ],
            [
                'id' => 'visanet',
                'name' => 'Visanet',
                'description' => 'Pagos Visanet',
                'icon' => 'visanet',
            ],
            [
                'id' => 'transfer',
                'name' => 'Transferencia Bancaria',
                'description' => 'Transferencia a cuenta bancaria',
                'icon' => 'bank',
            ],
            [
                'id' => 'cod',
                'name' => 'Contra Entrega',
                'description' => 'Pago al recibir',
                'icon' => 'delivery',
            ],
        ];

        return response()->json($methods);
    }

    /**
     * Get transaction history
     */
    public function history(Request $request)
    {
        $transactions = PaymentTransaction::where('order_id', function ($query) use ($request) {
            $query->select('id')
                  ->from('orders')
                  ->where('user_id', $request->user()->id)
                  ->whereColumn('orders.id', 'payment_transactions.order_id');
        })->with('order')->latest()->paginate(10);

        return response()->json($transactions);
    }
}
