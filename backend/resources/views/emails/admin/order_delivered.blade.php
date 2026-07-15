<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10b981; }
        .order-info { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 30px; }
        .button { display: inline-block; padding: 12px 25px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #10b981;">Garabito Shop RD - Admin</h1>
        </div>
        <h2>¡Venta Finalizada!</h2>
        <p>El cliente ha marcado el siguiente pedido como <strong>Recibido</strong>. La venta se considera completada.</p>

        <div class="order-info">
            <p><strong>Pedido:</strong> #{{ $order->order_number }}</p>
            <p><strong>Cliente:</strong> {{ $order->user->name }} ({{ $order->user->email }})</p>
            <p><strong>Total:</strong> RD$ {{ number_format($order->total, 2) }}</p>
            <p><strong>Fecha de Entrega:</strong> {{ $order->delivered_at->format('d/m/Y H:i') }}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="{{ config('app.frontend_url') }}/admin/pedidos/{{ $order->id }}" class="button">Ver Detalles en Panel</a>
        </div>

        <div class="footer">
            <p>© {{ date('Y') }} Garabito Shop RD.</p>
        </div>
    </div>
</body>
</html>
