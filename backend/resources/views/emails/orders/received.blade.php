<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
        .order-info { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .total { font-size: 20px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
        .button { display: inline-block; padding: 12px 25px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div className="container">
        <div className="header">
            <h1>Garabito Shop RD</h1>
        </div>
        <h2>¡Gracias por tu pedido, {{ $order->user->name }}!</h2>
        <p>Hemos recibido tu pedido correctamente. Aquí tienes los detalles:</p>

        <div className="order-info">
            <p><strong>Número de Pedido:</strong> #{{ $order->order_number }}</p>
            <p><strong>Método de Pago:</strong> {{ strtoupper($order->payment_method) }}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                    <th style="padding: 10px;">Producto</th>
                    <th style="padding: 10px;">Cant.</th>
                    <th style="padding: 10px;">Precio</th>
                </tr>
            </thead>
            <tbody>
                @foreach($order->items as $item)
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">{{ $item->product->name }}</td>
                    <td style="padding: 10px;">{{ $item->quantity }}</td>
                    <td style="padding: 10px;">RD$ {{ number_format($item->unit_price, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
            <p>Subtotal: RD$ {{ number_format($order->subtotal, 2) }}</p>
            <p>Envío: RD$ {{ number_format($order->shipping_cost, 2) }}</p>
            <p className="total">TOTAL: RD$ {{ number_format($order->total, 2) }}</p>
        </div>

        @if($order->payment_method === 'transfer')
        <div style="background: #eef2ff; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #2563eb;">
            <p><strong>Instrucciones de Pago:</strong></p>
            <p>Favor transferir al Banco Popular: 778899001 (Corriente) a nombre de Garabito Tech. Envía tu comprobante por WhatsApp.</p>
        </div>
        @endif

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.frontend_url') }}/cuenta/pedidos" className="button">Ver mi Pedido</a>
        </div>

        <div className="footer">
            <p>© {{ date('Y') }} Garabito Shop RD. Santo Domingo, República Dominicana.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>
    </div>
</body>
</html>
