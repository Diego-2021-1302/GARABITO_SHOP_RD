<?php

namespace App\Http\Controllers;

use App\Models\PurchaseInvoice;
use App\Models\PurchaseInvoiceDetail;
use App\Models\Warehouse;
use App\Services\Inventory\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PurchaseInvoiceController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }
    public function index(Request $request)
    {
        $query = PurchaseInvoice::with(['provider', 'warehouse'])->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('invoice_number', 'like', "%$search%")
                  ->orWhereHas('provider', function($q) use ($search) {
                      $q->where('commercial_name', 'like', "%$search%");
                  });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'invoice_number' => 'required|string',
            'invoice_date' => 'required|date',
            'payment_terms_days' => 'required|integer|min:0',
            'notes' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_cost' => 'required|numeric|min:0',
            'details.*.discount' => 'nullable|numeric|min:0',
            'details.*.tax' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $invoiceDate = Carbon::parse($validated['invoice_date']);
            $dueDate = $invoiceDate->copy()->addDays((int) $validated['payment_terms_days']);
            $warehouse = isset($validated['warehouse_id']) ? Warehouse::find($validated['warehouse_id']) : null;

            $invoice = PurchaseInvoice::create([
                'provider_id' => $validated['provider_id'],
                'warehouse_id' => $validated['warehouse_id'] ?? null,
                'invoice_number' => $validated['invoice_number'],
                'invoice_date' => $invoiceDate,
                'payment_terms_days' => $validated['payment_terms_days'],
                'due_date' => $dueDate,
                'status' => 'pending',
                'notes' => $validated['notes'] ?? null,
                'subtotal' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
            ]);

            $subtotal = 0;
            $taxAmount = 0;
            $discountAmount = 0;

            foreach ($validated['details'] as $detail) {
                $itemSubtotal = $detail['quantity'] * $detail['unit_cost'];
                $itemDiscount = $detail['discount'] ?? 0;
                $itemTax = $detail['tax'] ?? 0;
                $itemTotal = $itemSubtotal - $itemDiscount + $itemTax;

                PurchaseInvoiceDetail::create([
                    'purchase_invoice_id' => $invoice->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_cost' => $detail['unit_cost'],
                    'discount' => $itemDiscount,
                    'tax' => $itemTax,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                ]);

                $subtotal += $itemSubtotal;
                $taxAmount += $itemTax;
                $discountAmount += $itemDiscount;
            }

            $invoice->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $subtotal - $discountAmount + $taxAmount,
            ]);

            $this->inventoryService->recordPurchaseInvoiceInventory($invoice, $validated['details'], $warehouse);

            return response()->json($invoice->load('details.product', 'provider', 'warehouse'), 201);
        });
    }

    public function show($id)
    {
        $invoice = PurchaseInvoice::with(['provider', 'warehouse', 'details.product'])->findOrFail($id);
        return response()->json($invoice);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'provider_id' => 'required|exists:providers,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'invoice_number' => 'required|string',
            'invoice_date' => 'required|date',
            'payment_terms_days' => 'required|integer|min:0',
            'notes' => 'nullable|string',
            'details' => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity' => 'required|integer|min:1',
            'details.*.unit_cost' => 'required|numeric|min:0',
            'details.*.discount' => 'nullable|numeric|min:0',
            'details.*.tax' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $invoice = PurchaseInvoice::with('details')->findOrFail($id);
            $oldInvoiceNumber = $invoice->invoice_number;

            $this->inventoryService->revertPurchaseInvoiceInventory($invoice, $oldInvoiceNumber);
            $invoice->details()->delete();

            // 3. Actualizar cabecera
            $invoiceDate = Carbon::parse($validated['invoice_date']);
            $dueDate = $invoiceDate->copy()->addDays((int) $validated['payment_terms_days']);

            $warehouse = isset($validated['warehouse_id']) ? Warehouse::find($validated['warehouse_id']) : null;

            $invoice->update([
                'provider_id' => $validated['provider_id'],
                'warehouse_id' => $validated['warehouse_id'] ?? null,
                'invoice_number' => $validated['invoice_number'],
                'invoice_date' => $invoiceDate,
                'payment_terms_days' => $validated['payment_terms_days'],
                'due_date' => $dueDate,
                'notes' => $validated['notes'] ?? null,
            ]);

            $subtotal = 0;
            $taxAmount = 0;
            $discountAmount = 0;

            // 4. Crear nuevos detalles
            foreach ($validated['details'] as $detail) {
                $itemSubtotal = $detail['quantity'] * $detail['unit_cost'];
                $itemDiscount = $detail['discount'] ?? 0;
                $itemTax = $detail['tax'] ?? 0;

                PurchaseInvoiceDetail::create([
                    'purchase_invoice_id' => $invoice->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'unit_cost' => $detail['unit_cost'],
                    'discount' => $itemDiscount,
                    'tax' => $itemTax,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemSubtotal - $itemDiscount + $itemTax,
                ]);

                $subtotal += $itemSubtotal;
                $taxAmount += $itemTax;
                $discountAmount += $itemDiscount;
            }

            $invoice->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $subtotal - $discountAmount + $taxAmount,
            ]);

            $this->inventoryService->recordPurchaseInvoiceInventory($invoice, $validated['details'], $warehouse);

            return response()->json($invoice->load('details.product', 'provider', 'warehouse'));
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,paid,overdue',
        ]);

        $invoice = PurchaseInvoice::findOrFail($id);
        $invoice->update(['status' => $validated['status']]);

        return response()->json($invoice);
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $invoice = PurchaseInvoice::findOrFail($id);

            $this->inventoryService->revertPurchaseInvoiceInventory($invoice);
            $invoice->delete();

            return response()->json(['message' => 'Factura eliminada correctamente']);
        });
    }
}
