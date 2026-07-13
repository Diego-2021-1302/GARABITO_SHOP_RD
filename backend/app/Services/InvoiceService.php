<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderInvoiceMail;

class InvoiceService
{
    /**
     * Genera el PDF de la factura para un pedido.
     */
    public function generateInvoicePDF(Order $order): string
    {
        $order->load(['user', 'items.product', 'shippingAddress']);

        $settingsModel = \App\Models\StoreSetting::where('key', 'general')->first();
        $settings = $settingsModel ? $settingsModel->value : [
            'storeName' => 'Garabito Shop RD',
            'supportPhone' => '(809) 555-0192',
            'contactEmail' => 'info@garabitoshop.do'
        ];

        $fileName = 'factura_' . $order->order_number . '.pdf';
        $path = 'invoices/' . $fileName;

        try {
            // Mock de contenido PDF para este entorno
            $htmlContent = view('emails.orders.invoice_pdf', compact('order', 'settings'))->render();
            Storage::disk('public')->put($path, $htmlContent);

            $order->update(['invoice_pdf_path' => $path]);

            // Enviar factura por correo
            try {
                Mail::to($order->user->email)->send(new OrderInvoiceMail($order));
            } catch (\Exception $e) {
                Log::error("Error enviando correo de factura: " . $e->getMessage());
            }

            return $path;
        } catch (\Exception $e) {
            Log::error("Error generando factura PDF: " . $e->getMessage());
            return '';
        }
    }

    public function getInvoiceUrl(Order $order): ?string
    {
        if (!$order->invoice_pdf_path) {
            return null;
        }
        return asset('storage/' . $order->invoice_pdf_path);
    }
}
