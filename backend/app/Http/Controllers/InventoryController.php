<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    public function index(Request $request)
    {
        $query = InventoryMovement::with(['product', 'user'])->latest();

        // Filtro por tipo (entrada, salida, ajuste)
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filtro por producto específico (ID)
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Búsqueda general por nombre de producto
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%");
            });
        }

        // Filtro por rango de fechas
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->paginate(20));
    }

    public function stats()
    {
        $month = now()->startOfMonth();

        return response()->json([
            'entries_month' => InventoryMovement::where('type', 'entry')->where('created_at', '>=', $month)->sum('quantity'),
            'exits_month' => abs(InventoryMovement::where('type', 'exit')->where('created_at', '>=', $month)->sum('quantity')),
            'critical_stock' => Product::where('minimum_stock', '>', 0)
                                       ->whereRaw('stock_quantity <= minimum_stock')
                                       ->count(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:entry,exit',
            'reason' => 'nullable|string|max:255',
        ]);

        $direction = $validated['type'] === 'exit' ? 'exit' : 'entry';

        $document = $this->inventoryService->recordInventoryAdjustment([
            [
                'product_id' => $validated['product_id'],
                'quantity' => $validated['quantity'],
                'type' => $direction,
                'reason' => $validated['reason'] ?? null,
            ],
        ], null, $validated['reason'] ?? null);

        return response()->json($document->load('lines.product', 'warehouse', 'user'), 201);
    }
}
