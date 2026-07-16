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
    public function generateInvoicePDF(Order $order): ?string
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

            // Asegurar que el directorio existe
            if (!Storage::disk('public')->exists('invoices')) {
                Storage::disk('public')->makeDirectory('invoices');
            }

            // Si está instalado DomPDF, lo usamos para generar un PDF real
            if (class_exists('\Barryvdh\DomPDF\Facade\Pdf')) {
                $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($htmlContent);
                Storage::disk('public')->put($path, $pdf->output());
            } else {
                Log::warning("DomPDF no encontrado, se guardó factura como HTML con extensión PDF.");
                Storage::disk('public')->put($path, $htmlContent);
            }

            // Cambiar visibilidad a pública para que sea accesible vía URL
            Storage::disk('public')->setVisibility($path, 'public');

            $order->update(['invoice_pdf_path' => $path]);

            // Enviar factura por correo automáticamente si el pedido ya está confirmado o pagado
            if ($order->status === \App\Models\Order::STATUS_PAID_CONFIRMED ||
                $order->payment_status === \App\Models\Order::PAYMENT_STATUS_COMPLETED ||
                $order->status === \App\Models\Order::STATUS_DELIVERED) {
                $this->sendInvoiceByEmail($order);
            }

            return $path;
        } catch (\Exception $e) {
            Log::error("Error generando factura PDF para pedido {$order->order_number}: " . $e->getMessage());
            throw $e; // Re-lanzar para que el Job pueda reintentar si es necesario
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
