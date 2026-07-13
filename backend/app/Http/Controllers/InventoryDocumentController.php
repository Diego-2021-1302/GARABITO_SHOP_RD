<?php

namespace App\Http\Controllers;

use App\Models\InventoryDocument;
use Illuminate\Http\Request;

class InventoryDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryDocument::with(['provider', 'warehouse', 'destinationWarehouse', 'user', 'order', 'purchaseInvoice', 'lines.product', 'movements.product'])->latest();

        if ($request->filled('document_type')) {
            $query->where('document_type', $request->document_type);
        }

        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        if ($request->filled('purchase_invoice_id')) {
            $query->where('purchase_invoice_id', $request->purchase_invoice_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('provider_id')) {
            $query->where('provider_id', $request->provider_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                  ->orWhere('reference_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
            });
        }

        return response()->json($query->paginate(20));
    }

    public function show($id)
    {
        $document = InventoryDocument::with(['provider', 'warehouse', 'destinationWarehouse', 'user', 'order', 'purchaseInvoice', 'lines.product'])->findOrFail($id);

        return response()->json($document);
    }
}
