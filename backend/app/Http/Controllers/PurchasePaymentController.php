<?php

namespace App\Http\Controllers;

use App\Models\PurchasePayment;
use App\Models\PurchaseInvoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchasePaymentController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchasePayment::with(['purchaseInvoice.provider']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('transaction_number', 'like', "%{$search}%")
                ->orWhereHas('purchaseInvoice', function($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%");
                });
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'purchase_invoice_id' => 'required|exists:purchase_invoices,id',
            'payment_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'bank_name' => 'required|string',
            'transaction_number' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $payment = PurchasePayment::create($validated);

            // Actualizar el estado de la factura a pagada
            $invoice = PurchaseInvoice::find($validated['purchase_invoice_id']);
            if ($invoice) {
                $invoice->status = 'paid';
                $invoice->save();
            }

            return response()->json($payment->load('purchaseInvoice'), 201);
        });
    }

    public function show($id)
    {
        $payment = PurchasePayment::with(['purchaseInvoice.provider'])->findOrFail($id);
        return response()->json($payment);
    }

    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $payment = PurchasePayment::findOrFail($id);
            $invoiceId = $payment->purchase_invoice_id;

            $payment->delete();

            // Al eliminar el pago, devolvemos la factura al estado pendiente
            $invoice = PurchaseInvoice::find($invoiceId);
            if ($invoice) {
                $invoice->status = 'pending';
                // Opcional: Podrías verificar la fecha de vencimiento para ponerla como 'overdue' si ya pasó
                $invoice->save();
            }

            return response()->json(['message' => 'Pago eliminado correctamente y estado de factura revertido']);
        });
    }
}
