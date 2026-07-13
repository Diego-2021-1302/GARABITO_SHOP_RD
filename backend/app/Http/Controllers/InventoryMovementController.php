<?php

namespace App\Http\Controllers;

use App\Models\InventoryMovement;
use App\Models\Product;
use Illuminate\Http\Request;

class InventoryMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryMovement::with(['product', 'user', 'inventoryDocument', 'warehouse'])->latest();

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('movement_category')) {
            $query->where('movement_category', $request->movement_category);
        }

        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        if ($request->filled('document_type')) {
            $query->whereHas('inventoryDocument', function ($q) use ($request) {
                $q->where('document_type', $request->document_type);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhereHas('product', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                  })
                  ->orWhereHas('inventoryDocument', function ($q) use ($search) {
                      $q->where('document_number', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json($query->paginate(20));
    }

    public function show($id)
    {
        $movement = InventoryMovement::with(['product', 'user', 'inventoryDocument', 'warehouse'])->findOrFail($id);

        return response()->json($movement);
    }

    public function kardex(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_date' => 'sometimes|date',
            'to_date' => 'sometimes|date',
        ]);

        $product = Product::findOrFail($request->product_id);

        $movements = InventoryMovement::with(['inventoryDocument', 'warehouse', 'user'])
            ->where('product_id', $product->id)
            ->when($request->filled('from_date'), fn($q) => $q->whereDate('created_at', '>=', $request->from_date))
            ->when($request->filled('to_date'), fn($q) => $q->whereDate('created_at', '<=', $request->to_date))
            ->orderBy('created_at')
            ->get();

        $runningBalance = 0;
        $ledger = $movements->map(function ($movement) use (&$runningBalance) {
            $runningBalance += $movement->type === 'entry' ? $movement->quantity : -abs($movement->quantity);

            return [
                'id' => $movement->id,
                'date' => $movement->created_at->toDateTimeString(),
                'quantity' => $movement->quantity,
                'type' => $movement->type,
                'movement_category' => $movement->movement_category,
                'warehouse' => $movement->warehouse?->name,
                'document' => $movement->inventoryDocument?->document_number,
                'document_type' => $movement->inventoryDocument?->document_type,
                'reference' => $movement->reference,
                'reason' => $movement->reason,
                'running_balance' => $runningBalance,
                'cost_unit' => $movement->cost_unit,
                'cost_total' => $movement->cost_total,
            ];
        });

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
            ],
            'ledger' => $ledger,
        ]);
    }
}
