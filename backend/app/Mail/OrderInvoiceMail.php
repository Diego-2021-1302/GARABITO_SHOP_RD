<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class OrderInvoiceMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order->load(['user', 'items.product']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu factura del pedido #' . $this->order->order_number . ' - Garabito Shop RD',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.orders.invoice',
        );
    }

    public function attachments(): array
    {
        $attachments = [];

        if ($this->order->invoice_pdf_path) {
            $path = Storage::disk('public')->path($this->order->invoice_pdf_path);
            if (file_exists($path)) {
                $attachments[] = Attachment::fromPath($path)
                    ->as('Factura_' . $this->order->order_number . '.pdf')
                    ->withMime('application/pdf');
            }
        }

        return $attachments;
    }
}
