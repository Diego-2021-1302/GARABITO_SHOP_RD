<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateOrderInvoice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $orderId;

    /**
     * Create a new job instance.
     */
    public function __construct($orderId)
    {
        $this->orderId = $orderId;
    }

    /**
     * Execute the job.
     */
    public function handle(InvoiceService $invoiceService): void
    {
        $order = Order::find($this->orderId);

        if (!$order) {
            return;
        }

        try {
            $invoiceService->generateInvoicePDF($order);
        } catch (\Exception $e) {
            Log::error("Error en Job GenerateOrderInvoice para pedido {$this->orderId}: " . $e->getMessage());
        }
    }
}
