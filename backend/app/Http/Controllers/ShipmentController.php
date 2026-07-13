<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['order.user', 'driver'])->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('tracking_number', 'like', "%$search%")
                  ->orWhereHas('order', function($q) use ($search) {
                      $q->where('order_number', 'like', "%$search%");
                  })
                  ->orWhereHas('order.user', function($q) use ($search) {
                      $q->where('name', 'like', "%$search%");
                  });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function stats()
    {
        return response()->json([
            'in_transit' => Shipment::where('status', Shipment::STATUS_IN_TRANSIT)->count(),
            'pending' => Shipment::where('status', Shipment::STATUS_PENDING)->count(),
            'delivered_today' => Shipment::where('status', Shipment::STATUS_DELIVERED)->whereDate('updated_at', today())->count(),
            'failed' => Shipment::where('status', Shipment::STATUS_FAILED)->count(),
        ]);
    }

    /**
     * Obtener lista de repartidores disponibles
     */
    public function getDrivers()
    {
        $drivers = \App\Models\User::whereIn('role', [
            \App\Models\User::ROLE_DRIVER,
            \App\Models\User::ROLE_ADMIN,
            \App\Models\User::ROLE_STAFF
        ])
            ->where('is_active', true)
            ->select('id', 'name', 'phone')
            ->get();

        return response()->json($drivers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'driver_id' => 'nullable|exists:users,id',
            'carrier' => 'required|string',
            'tracking_number' => 'nullable|string',
            'estimated_delivery' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Validación: Solo pedidos con pago confirmado pueden tener envío (según requerimiento)
        if ($order->status === Order::STATUS_PENDING_PAYMENT || $order->status === Order::STATUS_PROOF_SUBMITTED) {
            return response()->json(['message' => 'El pago debe estar confirmado antes de crear un envío'], 422);
        }

        return DB::transaction(function () use ($validated, $order) {
            $shipment = Shipment::create(array_merge($validated, ['status' => Shipment::STATUS_PENDING]));

            return response()->json($shipment->load('order'), 201);
        });
    }

    public function update(Request $request, int|string $id)
    {
        $shipment = Shipment::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|string|in:pending,shipped,in_transit,out_for_delivery,delivered,failed',
            'driver_id' => 'nullable|exists:users,id',
            'tracking_number' => 'sometimes|string',
            'carrier' => 'sometimes|string',
            'notes' => 'sometimes|string',
            'actual_delivery' => 'nullable|date'
        ]);

        return DB::transaction(function () use ($shipment, $validated) {
            $shipment->update($validated);

            if (isset($validated['status'])) {
                $order = $shipment->order;
                $orderStatus = null;

                if ($validated['status'] === Shipment::STATUS_IN_TRANSIT || $validated['status'] === Shipment::STATUS_SHIPPED) {
                    $orderStatus = Order::STATUS_ON_WAY;
                    if (!$order->shipped_at) $order->shipped_at = now();
                }

                if ($orderStatus && $order->status !== $orderStatus) {
                    $order->status = $orderStatus;
                    $order->save();

                    OrderStatusHistory::create([
                        'order_id' => $order->id,
                        'status' => $orderStatus,
                        'comment' => "Estado de envío actualizado: " . str_replace('_', ' ', $validated['status']),
                        'user_id' => Auth::id(),
                    ]);
                }
            }

            return response()->json($shipment->load('driver'));
        });
    }

    /**
     * Obtener envíos activos asignados al repartidor autenticado
     */
    public function activeShipments(Request $request)
    {
        $query = Shipment::query()
            ->whereIn('status', [Shipment::STATUS_IN_TRANSIT, Shipment::STATUS_OUT_FOR_DELIVERY, Shipment::STATUS_PENDING]);

        // Si no es admin, solo sus propios envíos
        if (!$request->user()->isAdmin()) {
            $query->where('driver_id', $request->user()->id);
        }

        $shipments = $query->with(['order.shippingAddress', 'order.user'])
            ->latest()
            ->get();

        return response()->json($shipments);
    }

    /**
     * Actualizar ubicación GPS en tiempo real
     */
    public function updateLocation(Request $request, $id)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $shipment = Shipment::findOrFail($id);

        // Permitir si es el driver asignado O si es un Administrador
        if ($shipment->driver_id !== Auth::id() && Auth::user()->role !== \App\Models\User::ROLE_ADMIN) {
            return response()->json(['message' => 'No autorizado para actualizar ubicación'], 403);
        }

        $shipment->update([
            'current_lat' => $request->lat,
            'current_lng' => $request->lng,
            'last_location_update' => now(),
        ]);

        return response()->json(['message' => 'Ubicación actualizada', 'shipment' => $shipment]);
    }
}
