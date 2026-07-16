<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;
    public $statusLabel;
    public $comment;

    public function __construct(Order $order, string $statusLabel, ?string $comment = null)
    {
        $this->order = $order;
        $this->statusLabel = $statusLabel;
        $this->comment = $comment;
    }

    public function build()
    {
        return $this->subject("Tu pedido #{$this->order->order_number} ha cambiado a: {$this->statusLabel}")
                    ->view('emails.orders.status_updated');
    }
}
