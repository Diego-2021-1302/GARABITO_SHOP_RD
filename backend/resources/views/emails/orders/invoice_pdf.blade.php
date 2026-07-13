<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Pedido {{ $order->order_number }}</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; font-size: 12px; margin: 0; padding: 0; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, .15); }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-transform: uppercase; }
        .info-table { width: 100%; margin-bottom: 20px; }
        .info-table td { vertical-align: top; width: 50%; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background-color: #f3f4f6; text-align: left; padding: 10px; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 10px; }
        .items-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
        .totals-table { width: 40%; margin-left: auto; }
        .totals-table td { padding: 5px 0; }
        .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #2563eb; color: #2563eb; }
        .footer { text-align: center; margin-top: 50px; font-size: 10px; color: #9ca3af; border-top: 1px solid #eee; pt: 10px; }
        .status-badge { display: inline-block; padding: 5px 10px; background: #e0f2fe; color: #0369a1; border-radius: 5px; font-weight: bold; text-transform: uppercase; font-size: 10px; }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="logo">{{ strtoupper($settings['storeName'] ?? 'GARABITO SHOP RD') }}</div>
            <div style="font-size: 10px; color: #666; margin-top: 5px;">
                Santo Domingo, República Dominicana<br>
                Tel: {{ $settings['supportPhone'] ?? '(809) 555-0192' }} | {{ $settings['contactEmail'] ?? 'info@garabitoshop.do' }}
            </div>
        </div>

        <table class="info-table">
            <tr>
                <td>
                    <strong style="color: #666; font-size: 10px; text-transform: uppercase;">Cliente:</strong><br>
                    <span style="font-size: 14px; font-weight: bold;">{{ $order->user->name }}</span><br>
                    {{ $order->shippingAddress->address }}<br>
                    {{ $order->shippingAddress->city }}, RD<br>
                    Tel: {{ $order->user->phone ?? 'N/A' }}
                </td>
                <td style="text-align: right;">
                    <strong style="color: #666; font-size: 10px; text-transform: uppercase;">Detalles del Pedido:</strong><br>
                    <span style="font-size: 14px; font-weight: bold;">ORDEN #{{ $order->order_number }}</span><br>
                    <strong>Fecha Pago:</strong> {{ $order->paid_at ? $order->paid_at->format('d/m/Y H:i') : now()->format('d/m/Y') }}<br>
                    <strong>Método:</strong> {{ strtoupper(str_replace('_', ' ', $order->payment_method)) }}<br>
                    <div style="margin-top: 5px;"><span class="status-badge">Pago Confirmado</span></div>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Descripción del Producto</th>
                    <th style="text-align: center;">Cant.</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr>
                    <td>
                        <strong>{{ $item->product->name }}</strong>
                        @if($item->notes)<br><small style="color: #666;">{{ $item->notes }}</small>@endif
                    </td>
                    <td style="text-align: center;">{{ $item->quantity }}</td>
                    <td style="text-align: right;">RD$ {{ number_format($item->unit_price, 2) }}</td>
                    <td style="text-align: right;">RD$ {{ number_format($item->subtotal, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <table class="totals-table">
            <tr>
                <td style="color: #666;">Subtotal:</td>
                <td style="text-align: right;">RD$ {{ number_format($order->subtotal, 2) }}</td>
            </tr>
            @if($order->shipping_cost > 0)
            <tr>
                <td style="color: #666;">Envío:</td>
                <td style="text-align: right;">RD$ {{ number_format($order->shipping_cost, 2) }}</td>
            </tr>
            @else
            <tr>
                <td style="color: #666;">Envío:</td>
                <td style="text-align: right; color: #10b981;">GRATIS</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>TOTAL A PAGAR:</td>
                <td style="text-align: right;">RD$ {{ number_format($order->total, 2) }}</td>
            </tr>
        </table>

        <div class="footer">
            <p>Este documento es un comprobante de pago emitido por Garabito Shop RD.</p>
            <p>Si tiene alguna duda sobre su pedido, por favor contáctenos a través de nuestros canales oficiales.</p>
            <p><strong>¡Gracias por confiar en nosotros!</strong></p>
        </div>
    </div>
</body>
</html>
