<?php

namespace App\Http\Controllers;

use App\Mail\OrderStatusUpdated;
use App\Mail\AdminNewPaymentProof;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Services\Inventory\InventoryService;
use App\Services\InvoiceService;
use App\Mail\OrderReceived;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    protected InventoryService $inventoryService;
    protected InvoiceService $invoiceService;

    public function __construct(
        InventoryService $inventoryService,
        InvoiceService $invoiceService
    ) {
        $this->inventoryService = $inventoryService;
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request)
    {
        $orders = $request->user()
                         ->orders()
                         ->with(['items.product.images', 'statusHistory'])
                         ->latest()
                         ->paginate(10);

        return response()->json($orders);
    }

    public function adminIndex(Request $request)
    {
        $query = Order::with(['user', 'items.product.images', 'statusHistory'])->latest();

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function show(Request $request, int|string $id)
    {
        $order = Order::with([
            'items.product.images',
            'shippingAddress',
            'billingAddress',
            'user',
            'paymentTransaction',
            'shipment.driver',
            'statusHistory.user'
        ])->findOrFail($id);

        if ($order->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'shipping_address_id' => 'required|exists:addresses,id',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['id']);

                if ($product->available_stock < $item['quantity']) {
                    return response()->json(['message' => "Stock insuficiente para: {$product->name}. Disponible: {$product->available_stock}"], 422);
                }

                $price = $product->discount_price ?? $product->price;
                $itemTotal = $price * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $price,
                    'subtotal' => $itemTotal,
                ];
            }

            // Eliminado ITBIS y NCF según requerimiento: "Simple Online Store"
            $shipping = $subtotal > 5000 ? 0 : 250;
            $total = $subtotal + $shipping;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => 'GS-' . strtoupper(Str::random(10)),
                'status' => Order::STATUS_PENDING_PAYMENT,
                'subtotal' => $subtotal,
                'shipping_cost' => $shipping,
                'total' => $total,
                'payment_method' => $validated['payment_method'],
                'payment_status' => Order::PAYMENT_STATUS_PENDING,
                'shipping_address_id' => $validated['shipping_address_id'],
                'billing_address_id' => $validated['shipping_address_id'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($orderItemsData as $itemData) {
                $order->items()->create($itemData);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => Order::STATUS_PENDING_PAYMENT,
                'comment' => 'Pedido realizado. Pendiente de pago.',
                'user_id' => Auth::id(),
            ]);

            // Reserva de inventario inmediata
            $this->inventoryService->reserveOrderStock($order);

            try {
                Mail::to($request->user()->email)->send(new OrderReceived($order));
            } catch (\Exception $e) {
                Log::error('Error enviando correo de pedido: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Pedido realizado con éxito. Por favor procede a realizar el pago y subir tu comprobante.',
                'order' => $order->load('items.product'),
            ], 201);
        });
    }

    public function uploadPaymentProof(Request $request, $id)
    {
        $request->validate([
            'proof' => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:10240', // 10MB max
            'amount_paid' => 'required|numeric',
            'issuing_bank' => 'required|string',
            'confirm_owner' => 'required|accepted',
        ]);

        $order = Order::findOrFail($id);

        if ($order->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Consolidación de estados en español para el cliente
        if (!in_array($order->status, [Order::STATUS_PENDING_PAYMENT])) {
            return response()->json(['message' => 'No se puede subir comprobante en este estado'], 400);
        }

        // Validación de intentos
        if ($order->payment_attempts >= 5) {
            return response()->json(['message' => 'Has excedido el límite de intentos de subida. Contacta a soporte.'], 422);
        }

        // El monto debe coincidir exactamente
        if (round((float)$request->amount_paid, 2) !== round((float)$order->total, 2)) {
            $order->increment('payment_attempts');
            return response()->json([
                'message' => 'El monto pagado no coincide con el total del pedido.',
                'order_total' => $order->total
            ], 422);
        }

        $path = $request->file('proof')->store('payment_proofs', 'public');

        $order->update([
            'status' => Order::STATUS_PROOF_SUBMITTED,
            'payment_proof' => $path,
            'amount_paid' => $request->amount_paid,
            'issuing_bank' => $request->issuing_bank,
            'proof_uploaded_at' => now(),
        ]);

        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => Order::STATUS_PROOF_SUBMITTED,
            'comment' => "El cliente ha subido el comprobante de pago. Banco: {$request->issuing_bank}",
            'user_id' => Auth::id(),
        ]);

        // Notificar administradores
        try {
            $admins = \App\Models\User::where('role', \App\Models\User::ROLE_ADMIN)->get();
            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(new AdminNewPaymentProof($order));
            }
        } catch (\Exception $e) {
            Log::error('Error enviando notificación a admin: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Comprobante enviado con éxito.',
            'order' => $order
        ]);
    }

    public function updateStatus(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);

        if (! $request->user()->isAdmin()) {
             return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string',
            'comment' => 'nullable|string',
            'driver_id' => 'nullable|exists:users,id',
            'rejection_reason' => 'nullable|string',
        ]);

        $newStatus = $validated['status'];
        $oldStatus = $order->status;

        // Lógica de rechazo de comprobante (Comprobante Subido -> Pendiente de Pago)
        if ($oldStatus === Order::STATUS_PROOF_SUBMITTED && $newStatus === Order::STATUS_PENDING_PAYMENT) {
            $reason = $validated['rejection_reason'] ?? $validated['comment'] ?? 'Comprobante rechazado';

            return DB::transaction(function () use ($order, $reason) {
                $order->update(['status' => Order::STATUS_PENDING_PAYMENT]);

                OrderStatusHistory::create([
                    'order_id' => $order->id,
                    'status' => Order::STATUS_PENDING_PAYMENT,
                    'comment' => "PAGO RECHAZADO: " . $reason,
                    'user_id' => Auth::id(),
                ]);

                try {
                    Mail::to($order->user->email)->send(new OrderStatusUpdated($order, 'Comprobante Rechazado', $reason));
                } catch (\Exception $e) {
                    Log::error('Error enviando correo de rechazo: ' . $e->getMessage());
                }

                return response()->json(['message' => 'Comprobante rechazado correctamente', 'order' => $order]);
            });
        }

        // Restricción: El admin no puede cambiar estados si el pedido está "Pendiente de Pago"
        // (A menos que sea para cancelar o sea un pedido en efectivo/COD)
        if ($oldStatus === Order::STATUS_PENDING_PAYMENT && $newStatus !== Order::STATUS_CANCELLED && $order->payment_method !== 'cod') {
            return response()->json([
                'message' => 'El administrador debe esperar a que el cliente envíe el comprobante de pago.'
            ], 422);
        }

        // Restricción: El admin no puede marcar como "Entregado". Solo el cliente puede hacerlo.
        if ($newStatus === Order::STATUS_DELIVERED) {
            return response()->json([
                'message' => 'Solo el cliente puede marcar el pedido como entregado para confirmar la recepción.'
            ], 422);
        }

        // Validar flujo secuencial estricto
        if (!$order->canChangeToStatus($newStatus)) {
            $nextStatus = $order->getNextStatus();
            $nextStatusLabel = $nextStatus ? str_replace('_', ' ', $nextStatus) : 'ninguno';

            return response()->json([
                'message' => "Flujo inválido. El siguiente estado lógico debe ser: " . strtoupper($nextStatusLabel)
            ], 422);
        }

        return DB::transaction(function () use ($order, $newStatus, $oldStatus, $validated) {
            switch ($newStatus) {
                case Order::STATUS_PAID_CONFIRMED:
                    if ($order->payment_status !== Order::PAYMENT_STATUS_COMPLETED) {
                        $order->payment_status = Order::PAYMENT_STATUS_COMPLETED;
                        $order->paid_at = now();

                        // Salida definitiva de inventario
                        $this->inventoryService->finalizeOrderStockExit($order);

                        // Generar Factura PDF (Sin NCF ni ITBIS) y enviar correo
                        $this->invoiceService->generateInvoicePDF($order);
                    }
                    break;

                case Order::STATUS_PREPARING:
                    $order->preparing_at = now();
                    break;

                case Order::STATUS_READY_FOR_SHIPPING:
                    $order->ready_for_shipping_at = now();
                    break;

                case Order::STATUS_ON_WAY:
                    $order->shipped_at = now();
                    // Asignar repartidor
                    $driverId = $validated['driver_id'] ?? null;
                    $order->shipment()->updateOrCreate(
                        ['order_id' => $order->id],
                        [
                            'driver_id' => $driverId,
                            'status' => 'in_transit',
                            'shipped_date' => now()
                        ]
                    );
                    break;

                case Order::STATUS_DELIVERED:
                    $order->delivered_at = now();
                    if ($order->payment_method === 'cod') {
                        $order->payment_status = Order::PAYMENT_STATUS_COMPLETED;
                        $order->paid_at = now();

                        // Para pedidos COD, la salida de inventario se hace al entregar
                        $this->inventoryService->finalizeOrderStockExit($order);
                    }
                    if ($order->shipment) {
                        $order->shipment->update(['status' => 'delivered', 'actual_delivery' => now()]);
                    }
                    break;

                case Order::STATUS_CANCELLED:
                    if ($oldStatus !== Order::STATUS_CANCELLED) {
                        $order->cancelled_at = now();
                        if ($order->payment_status === Order::PAYMENT_STATUS_COMPLETED) {
                             $this->inventoryService->revertSalesOrderInventory($order);
                        } else {
                             $this->inventoryService->releaseOrderStock($order);
                        }
                    }
                    break;
            }

            $order->status = $newStatus;
            $order->save();

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'comment' => $validated['comment'] ?? "Estado actualizado a " . str_replace('_', ' ', $newStatus) . ".",
                'user_id' => Auth::id(),
            ]);

            // Enviar notificación por correo
            try {
                $statusLabel = [
                    Order::STATUS_PENDING_PAYMENT => 'Pendiente de Pago',
                    Order::STATUS_PROOF_SUBMITTED => 'Comprobante Subido',
                    Order::STATUS_PAID_CONFIRMED => 'Pago Confirmado',
                    Order::STATUS_PREPARING => 'Preparando Pedido',
                    Order::STATUS_READY_FOR_SHIPPING => 'Listo para Envío',
                    Order::STATUS_ON_WAY => 'En Camino',
                    Order::STATUS_DELIVERED => 'Entregado',
                    Order::STATUS_CANCELLED => 'Cancelado',
                ][$newStatus] ?? $newStatus;

                Mail::to($order->user->email)->send(new OrderStatusUpdated($order, $statusLabel, $validated['comment'] ?? null));
            } catch (\Exception $e) {
                Log::error('Error enviando correo de actualización de estado: ' . $e->getMessage());
            }

            return response()->json($order->load(['statusHistory.user', 'shipment.driver']));
        });
    }

    public function markAsDelivered(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);

        if ($order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($order->status !== Order::STATUS_ON_WAY) {
            return response()->json(['message' => 'El pedido debe estar en camino para marcarlo como entregado'], 400);
        }

        return DB::transaction(function () use ($order) {
            $order->update([
                'status' => Order::STATUS_DELIVERED,
                'delivered_at' => now(),
            ]);

            if ($order->shipment) {
                $order->shipment->update(['status' => 'delivered', 'actual_delivery' => now()]);
            }

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => Order::STATUS_DELIVERED,
                'comment' => 'El cliente ha confirmado la recepción del pedido.',
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'message' => 'Pedido marcado como entregado con éxito.',
                'order' => $order
            ]);
        });
    }

    public function cancel(Request $request, int|string $id)
    {
        $order = Order::findOrFail($id);

        if (! $request->user()->isAdmin() && $order->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if (in_array($order->status, [Order::STATUS_ON_WAY, Order::STATUS_DELIVERED, Order::STATUS_CANCELLED])) {
            return response()->json(['message' => 'No se puede cancelar en este estado'], 400);
        }

        DB::transaction(function () use ($order, $request) {
            if ($order->payment_status === Order::PAYMENT_STATUS_COMPLETED) {
                $this->inventoryService->revertSalesOrderInventory($order);
            } else {
                $this->inventoryService->releaseOrderStock($order);
            }

            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'cancelled_at' => now(),
            ]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => Order::STATUS_CANCELLED,
                'comment' => 'Pedido cancelado por ' . ($request->user()->isAdmin() ? 'admin' : 'cliente') . '.',
                'user_id' => Auth::id(),
            ]);
        });

        return response()->json(['message' => 'Pedido cancelado', 'order' => $order]);
    }
}
