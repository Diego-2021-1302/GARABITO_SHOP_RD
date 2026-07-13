<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 10px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
        .button { display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Pago Confirmado!</h1>
        </div>
        <div class="content">
            <p>Hola, <strong>{{ $order->user->name }}</strong>.</p>
            <p>Hemos validado tu pago para el pedido <strong>#{{ $order->order_number }}</strong>. Adjunto a este correo encontrarás tu factura formal.</p>
            <p>Tu pedido ahora está siendo preparado para el envío.</p>
            <p>Puedes seguir el progreso de tu pedido desde tu cuenta:</p>
            <p style="text-align: center;">
                <a href="{{ config('app.frontend_url') }}/cuenta/pedidos/{{ $order->id }}" class="button">Ver mi Pedido</a>
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Garabito Shop RD. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
