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
            $htmlContent = view('emails.orders.invoice_pdf', compact('order', 'settings'))->render();

            // Si está instalado DomPDF, lo usamos para generar un PDF real
            if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($htmlContent);
                Storage::disk('public')->put($path, $pdf->output());
            } else {
                // Fallback: Guardar como HTML pero con extensión PDF (no recomendado para producción)
                Storage::disk('public')->put($path, $htmlContent);
            }

            $order->update(['invoice_pdf_path' => $path]);

            // Enviar factura por correo automáticamente
            $this->sendInvoiceByEmail($order);

            return $path;
        } catch (\Exception $e) {
            Log::error("Error generando factura PDF: " . $e->getMessage());
            return '';
        }
    }

    /**
     * Envía la factura por correo al cliente.
     */
    public function sendInvoiceByEmail(Order $order): bool
    {
        try {
            if (!$order->user || !$order->user->email) {
                return false;
            }

            Mail::to($order->user->email)->send(new OrderInvoiceMail($order));
            return true;
        } catch (\Exception $e) {
            Log::error("Error enviando correo de factura para pedido {$order->order_number}: " . $e->getMessage());
            return false;
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
