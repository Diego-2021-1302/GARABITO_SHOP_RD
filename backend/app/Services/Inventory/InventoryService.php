<?php

namespace App\Services\Inventory;

use App\Models\InventoryDocument;
use App\Models\InventoryDocumentLine;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCostHistory;
use App\Models\PurchaseInvoice;
use App\Models\Warehouse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    /**
     * Reserva stock para un pedido (Aumenta reserved_stock, disminuye available_stock)
     */
    public function reserveOrderStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item->product_id);

                $product->reserved_stock += $item->quantity;
                $product->available_stock = max(0, $product->stock_quantity - $product->reserved_stock);
                $product->save();
            }
        });
    }

    /**
     * Libera la reserva de stock (Disminuye reserved_stock, aumenta available_stock)
     * Se usa cuando un pedido se cancela antes de ser pagado.
     */
    public function releaseOrderStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item->product_id);

                $product->reserved_stock = max(0, $product->reserved_stock - $item->quantity);
                $product->available_stock = max(0, $product->stock_quantity - $product->reserved_stock);
                $product->save();
            }
        });
    }

    /**
     * Ejecuta la salida definitiva del inventario (Disminuye stock_quantity y reserved_stock)
     * Se usa cuando el pedido es PAGADO.
     */
    public function finalizeOrderStockExit(Order $order, ?Warehouse $warehouse = null): ?InventoryDocument
    {
        // Evitar duplicados: si ya existe un documento de salida para este pedido, no hacemos nada
        $existingDocument = InventoryDocument::where('order_id', $order->id)
            ->where('document_type', 'sales_order')
            ->where('status', 'completed')
            ->first();

        if ($existingDocument) {
            return $existingDocument;
        }

        return DB::transaction(function () use ($order, $warehouse) {
            $document = InventoryDocument::create([
                'document_type' => 'sales_order',
                'document_number' => $order->order_number,
                'reference_number' => $order->order_number,
                'order_id' => $order->id,
                'warehouse_id' => $warehouse?->id,
                'user_id' => Auth::id(),
                'status' => 'completed',
                'issue_date' => now()->toDateString(),
                'due_date' => now()->toDateString(),
                'subtotal' => $order->subtotal,
                'tax_amount' => 0, // No ITBIS
                'discount_amount' => 0,
                'total_amount' => $order->total,
                'notes' => "Salida definitiva por pago de pedido {$order->order_number}",
            ]);

            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item->product_id);
                $quantityBefore = $product->stock_quantity;

                // Reducimos el stock físico y la reserva
                $product->stock_quantity -= $item->quantity;
                $product->reserved_stock = max(0, $product->reserved_stock - $item->quantity);
                $product->available_stock = max(0, $product->stock_quantity - $product->reserved_stock);
                $product->last_sale_at = now();
                $product->save();

                InventoryDocumentLine::create([
                    'inventory_document_id' => $document->id,
                    'product_id' => $product->id,
                    'quantity' => $item->quantity,
                    'quantity_received' => 0,
                    'unit_cost' => $product->last_cost ?? $product->average_cost ?? $product->cost ?? 0,
                    'unit_price' => $item->unit_price,
                    'discount' => 0,
                    'tax' => 0,
                    'subtotal' => $item->unit_price * $item->quantity,
                    'total' => $item->unit_price * $item->quantity,
                    'notes' => "Salida definitiva - Pedido {$order->order_number}",
                ]);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'user_id' => Auth::id(),
                    'inventory_document_id' => $document->id,
                    'warehouse_id' => $warehouse?->id,
                    'quantity' => $item->quantity,
                    'type' => 'exit',
                    'movement_category' => 'sale',
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $product->stock_quantity,
                    'cost_unit' => $product->last_cost ?? $product->average_cost ?? $product->cost ?? 0,
                    'cost_total' => ($product->last_cost ?? $product->average_cost ?? $product->cost ?? 0) * $item->quantity,
                    'reference' => $order->order_number,
                    'reason' => "Venta confirmada (Pagado) - Pedido {$order->order_number}",
                ]);
            }

            return $document;
        });
    }

    public function recordPurchaseInvoiceInventory(PurchaseInvoice $invoice, array $details, ?Warehouse $warehouse = null): InventoryDocument
    {
        return DB::transaction(function () use ($invoice, $details, $warehouse) {
            $document = InventoryDocument::create([
                'document_type' => 'purchase_invoice',
                'document_number' => $invoice->invoice_number,
                'reference_number' => $invoice->invoice_number,
                'provider_id' => $invoice->provider_id,
                'purchase_invoice_id' => $invoice->id,
                'warehouse_id' => $warehouse?->id,
                'user_id' => Auth::id(),
                'status' => $invoice->status,
                'issue_date' => $invoice->invoice_date,
                'due_date' => $invoice->due_date,
                'subtotal' => $invoice->subtotal,
                'tax_amount' => $invoice->tax_amount,
                'discount_amount' => $invoice->discount_amount,
                'total_amount' => $invoice->total_amount,
                'notes' => $invoice->notes,
            ]);

            foreach ($details as $detail) {
                $line = InventoryDocumentLine::create([
                    'inventory_document_id' => $document->id,
                    'product_id' => $detail['product_id'],
                    'quantity' => $detail['quantity'],
                    'quantity_received' => $detail['quantity'],
                    'unit_cost' => $detail['unit_cost'],
                    'unit_price' => Arr::get($detail, 'unit_price', 0),
                    'discount' => Arr::get($detail, 'discount', 0),
                    'tax' => Arr::get($detail, 'tax', 0),
                    'subtotal' => Arr::get($detail, 'subtotal', $detail['quantity'] * $detail['unit_cost']),
                    'total' => Arr::get($detail, 'total', $detail['quantity'] * $detail['unit_cost']),
                    'lot_number' => Arr::get($detail, 'lot_number'),
                    'expiration_date' => Arr::get($detail, 'expiration_date'),
                    'location' => Arr::get($detail, 'location'),
                    'notes' => Arr::get($detail, 'notes'),
                ]);

                $product = Product::lockForUpdate()->findOrFail($detail['product_id']);
                $quantityBefore = $product->stock_quantity;
                $quantityAfter = $quantityBefore + $detail['quantity'];

                $product->stock_quantity = $quantityAfter;
                $product->available_stock = max(0, $quantityAfter - $product->reserved_stock);
                $product->last_cost = $detail['unit_cost'];
                $product->last_cost_updated_at = now();
                $product->last_purchase_at = now();
                $product->main_provider_id = $invoice->provider_id;
                $product->average_cost = $this->calculateWeightedAverageCost($product, $detail['quantity'], $detail['unit_cost']);
                $product->save();

                ProductCostHistory::create([
                    'product_id' => $product->id,
                    'inventory_document_id' => $document->id,
                    'inventory_document_line_id' => $line->id,
                    'cost' => $detail['unit_cost'],
                    'average_cost' => $product->average_cost,
                    'quantity' => $detail['quantity'],
                    'total_cost' => $detail['quantity'] * $detail['unit_cost'],
                ]);

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'user_id' => Auth::id(),
                    'inventory_document_id' => $document->id,
                    'warehouse_id' => $warehouse?->id,
                    'purchase_invoice_id' => $invoice->id,
                    'quantity' => $detail['quantity'],
                    'type' => 'entry',
                    'movement_category' => 'purchase',
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'cost_unit' => $detail['unit_cost'],
                    'cost_total' => $detail['quantity'] * $detail['unit_cost'],
                    'reference' => $invoice->invoice_number,
                    'reason' => "Factura de Compra #{$invoice->invoice_number}",
                ]);
            }

            return $document;
        });
    }

    public function recordInventoryAdjustment(array $adjustments, ?Warehouse $warehouse = null, ?string $notes = null): InventoryDocument
    {
        return DB::transaction(function () use ($adjustments, $warehouse, $notes) {
            $document = InventoryDocument::create([
                'document_type' => 'inventory_adjustment',
                'document_number' => sprintf('ADJ-%s', strtoupper(uniqid())),
                'reference_number' => sprintf('ADJ-%s', strtoupper(uniqid())),
                'warehouse_id' => $warehouse?->id,
                'user_id' => Auth::id(),
                'status' => 'completed',
                'issue_date' => now()->toDateString(),
                'due_date' => now()->toDateString(),
                'subtotal' => 0,
                'tax_amount' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'notes' => $notes,
            ]);

            foreach ($adjustments as $adjustment) {
                $product = Product::lockForUpdate()->findOrFail($adjustment['product_id']);
                $quantityBefore = $product->stock_quantity;
                $quantity = $adjustment['quantity'];
                $direction = $adjustment['type'] === 'exit' ? -1 : 1;
                $quantityAfter = $quantityBefore + ($quantity * $direction);

                InventoryDocumentLine::create([
                    'inventory_document_id' => $document->id,
                    'product_id' => $product->id,
                    'quantity' => $quantity * $direction,
                    'quantity_received' => abs($quantity),
                    'unit_cost' => $product->last_cost ?? $product->cost ?? 0,
                    'unit_price' => 0,
                    'discount' => 0,
                    'tax' => 0,
                    'subtotal' => 0,
                    'total' => 0,
                    'notes' => $adjustment['reason'] ?? null,
                ]);

                $product->stock_quantity = $quantityAfter;
                $product->available_stock = max(0, $quantityAfter - $product->reserved_stock);
                $product->save();

                InventoryMovement::create([
                    'product_id' => $product->id,
                    'user_id' => Auth::id(),
                    'inventory_document_id' => $document->id,
                    'warehouse_id' => $warehouse?->id,
                    'quantity' => $quantity * $direction,
                    'type' => $quantityAfter >= $quantityBefore ? 'entry' : 'exit',
                    'movement_category' => 'adjustment',
                    'quantity_before' => $quantityBefore,
                    'quantity_after' => $quantityAfter,
                    'cost_unit' => $product->last_cost ?? $product->cost ?? 0,
                    'cost_total' => ($product->last_cost ?? $product->cost ?? 0) * abs($quantity),
                    'reference' => $document->document_number,
                    'reason' => $adjustment['reason'] ?? 'Ajuste de inventario manual',
                ]);
            }

            return $document;
        });
    }

    public function revertPurchaseInvoiceInventory(PurchaseInvoice $invoice, ?string $referenceNumber = null): void
    {
        DB::transaction(function () use ($invoice, $referenceNumber) {
            $invoiceReference = $referenceNumber ?? $invoice->invoice_number;

            $document = InventoryDocument::where('document_type', 'purchase_invoice')
                ->where('document_number', $invoiceReference)
                ->latest()
                ->first();

            if (! $document) {
                return;
            }

            $reversal = $this->createReversalInventoryDocument($document, 'supplier_return', 'Cancelación / reversión de factura de compra');

            $document->update([
                'status' => 'cancelled',
                'notes' => ($document->notes ?? '') . "\nRevertido por documento {$reversal->document_number}",
            ]);
        });
    }

    public function revertSalesOrderInventory(Order $order, ?string $referenceNumber = null): void
    {
        DB::transaction(function () use ($order, $referenceNumber) {
            $orderReference = $referenceNumber ?? $order->order_number;

            $document = InventoryDocument::where('document_type', 'sales_order')
                ->where('document_number', $orderReference)
                ->latest()
                ->first();

            if (! $document) {
                return;
            }

            $reversal = $this->createReversalInventoryDocument($document, 'customer_return', 'Cancelación / reversión de pedido de venta');

            $document->update([
                'status' => 'cancelled',
                'notes' => ($document->notes ?? '') . "\nRevertido por documento {$reversal->document_number}",
            ]);
        });
    }

    protected function createReversalInventoryDocument(InventoryDocument $original, string $reversalType, string $reasonSuffix): InventoryDocument
    {
        $reversalDocument = InventoryDocument::create([
            'document_type' => $reversalType,
            'document_number' => sprintf('%s-REV-%s', $original->document_number, strtoupper(uniqid())),
            'reference_number' => $original->document_number,
            'provider_id' => $original->provider_id,
            'order_id' => $original->order_id,
            'purchase_invoice_id' => $original->purchase_invoice_id,
            'warehouse_id' => $original->warehouse_id,
            'user_id' => Auth::id(),
            'status' => 'completed',
            'issue_date' => now()->toDateString(),
            'due_date' => now()->toDateString(),
            'subtotal' => 0,
            'tax_amount' => 0,
            'discount_amount' => 0,
            'total_amount' => 0,
            'notes' => "Reversión de documento {$original->document_number}: {$reasonSuffix}",
        ]);

        foreach ($original->lines as $line) {
            InventoryDocumentLine::create([
                'inventory_document_id' => $reversalDocument->id,
                'product_id' => $line->product_id,
                'quantity' => $line->quantity,
                'quantity_received' => abs($line->quantity),
                'unit_cost' => $line->unit_cost,
                'unit_price' => $line->unit_price,
                'discount' => $line->discount,
                'tax' => $line->tax,
                'subtotal' => 0,
                'total' => 0,
                'notes' => "Reversión de línea de documento original",
            ]);
        }

        foreach ($original->movements as $movement) {
            $product = Product::lockForUpdate()->find($movement->product_id);
            if (! $product) {
                continue;
            }

            $quantityBefore = $product->stock_quantity;
            $quantityAfter = $movement->type === 'entry'
                ? $quantityBefore - $movement->quantity
                : $quantityBefore + abs($movement->quantity);

            $product->stock_quantity = $quantityAfter;
            $product->available_stock = max(0, $quantityAfter - $product->reserved_stock);
            $product->save();

            InventoryMovement::create([
                'product_id' => $movement->product_id,
                'user_id' => Auth::id(),
                'inventory_document_id' => $reversalDocument->id,
                'warehouse_id' => $movement->warehouse_id,
                'quantity' => $movement->quantity,
                'type' => $movement->type === 'entry' ? 'exit' : 'entry',
                'movement_category' => $reversalType === 'customer_return' ? 'customer_return' : 'supplier_return',
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'cost_unit' => $movement->cost_unit,
                'cost_total' => $movement->cost_total,
                'reference' => $original->document_number,
                'reason' => "{$reasonSuffix} - reversión de movimiento original",
            ]);
        }

        return $reversalDocument;
    }

    protected function calculateWeightedAverageCost(Product $product, int $quantity, float $unitCost): float
    {
        $currentQuantity = $product->stock_quantity;
        $currentAverage = $product->average_cost ?? $product->cost ?? 0;
        $currentValue = $currentQuantity * $currentAverage;
        $incomingValue = $quantity * $unitCost;
        $newQuantity = $currentQuantity + $quantity;

        return $newQuantity > 0 ? (($currentValue + $incomingValue) / $newQuantity) : $unitCost;
    }
}
