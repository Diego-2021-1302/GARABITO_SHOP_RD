<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AdminNewPaymentProof extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;

    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    public function build()
    {
        $mail = $this->subject('Nuevo Comprobante de Pago - Pedido #' . $this->order->order_number)
                    ->view('emails.admin.new_payment_proof');

        if ($this->order->payment_proof) {
            // Como las imágenes están en Cloudinary (empiezan con http), las adjuntamos como datos
            try {
                $content = file_get_contents($this->order->payment_proof);
                if ($content) {
                    $mail->attachData($content, 'comprobante_' . $this->order->order_number . '.jpg', [
                        'mime' => 'image/jpeg',
                    ]);
                }
            } catch (\Exception $e) {
                // Si falla la descarga silenciosamente, el correo se envía sin adjunto pero con el link
            }
        }

        return $mail;
    }
}
