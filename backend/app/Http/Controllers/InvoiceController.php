<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\InvoiceService;
use App\Mail\OrderInvoiceMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    protected InvoiceService $invoiceService;

    public function __construct(InvoiceService $invoiceService)
    {
        $this->invoiceService = $invoiceService;
    }

    public function index(Request $request)
    {
        $query = Order::with('user')->whereNotNull('invoice_pdf_path')->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%$search%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%$search%");
                  });
            });
        }

        return response()->json($query->paginate(20));
    }

    public function download($id)
    {
        $order = Order::findOrFail($id);

        if (!$order->invoice_pdf_path || !Storage::disk('public')->exists($order->invoice_pdf_path)) {
            // Generar si no existe
            $this->invoiceService->generateInvoicePDF($order);
        }

        return Storage::disk('public')->download($order->invoice_pdf_path);
    }

    public function sendEmail($id)
    {
        $order = Order::findOrFail($id);

        try {
            // El mailable ya implementa ShouldQueue, así que se enviará en segundo plano
            Mail::to($order->user->email)->send(new OrderInvoiceMail($order));
            return response()->json(['message' => 'La factura se enviará por correo en unos momentos']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al programar el envío: ' . $e->getMessage()], 500);
        }
    }

    public function sendWhatsApp($id)
    {
        $order = Order::findOrFail($id);
        // Lógica de WhatsApp placeholder
        return response()->json(['message' => 'Integración con WhatsApp pendiente de configuración API']);
    }

    public function stats()
    {
        $thisMonth = now()->startOfMonth();

        return response()->json([
            'total_invoiced_month' => Order::where('payment_status', Order::PAYMENT_STATUS_COMPLETED)
                                          ->where('paid_at', '>=', $thisMonth)
                                          ->sum('total'),
            'pending_count' => Order::where('status', Order::STATUS_PROOF_SUBMITTED)->count(),
        ]);
    }
}
