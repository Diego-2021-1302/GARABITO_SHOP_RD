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
    <div class="container">
        <div class="header">
            <h1>Garabito Shop RD - Admin</h1>
        </div>
        <h2>Nuevo Comprobante Recibido</h2>
        <p>Un cliente ha subido un comprobante de pago para el siguiente pedido:</p>

        <div class="order-info">
            <p><strong>Pedido:</strong> #{{ $order->order_number }}</p>
            <p><strong>Cliente:</strong> {{ $order->user->name }} ({{ $order->user->email }})</p>
            <p><strong>Monto Declarado:</strong> RD$ {{ number_format($order->amount_paid, 2) }}</p>
            <p><strong>Banco:</strong> {{ $order->issuing_bank }}</p>
        </div>

        @if($order->payment_proof)
        <div style="margin-top: 20px; text-align: center;">
            <p><strong>Vista previa del comprobante:</strong></p>
            <img src="{{ $order->payment_proof }}" style="max-width: 100%; border-radius: 10px; border: 1px solid #ddd;" alt="Comprobante de Pago">
        </div>
        @endif

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.frontend_url') }}/admin/pedidos/{{ $order->id }}" class="button">Ver Pedido en Panel</a>
        </div>

        <div className="footer">
            <p>© {{ date('Y') }} Garabito Shop RD.</p>
        </div>
    </div>
</body>
</html>
