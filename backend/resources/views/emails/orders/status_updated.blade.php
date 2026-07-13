<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
        .status-badge { display: inline-block; padding: 5px 15px; background: #2563eb; color: #fff; border-radius: 5px; font-weight: bold; text-transform: uppercase; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #2563eb; margin: 0;">GARABITO SHOP RD</h1>
        </div>

        <h2>¡Hola, {{ $order->user->name }}!</h2>
        <p>Te informamos que el estado de tu pedido <strong>#{{ $order->order_number }}</strong> ha sido actualizado:</p>

        <div style="text-align: center; margin: 30px 0;">
            <span class="status-badge">{{ $statusLabel }}</span>
        </div>

        @if($comment)
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
                <p style="margin: 0; font-style: italic;">"{{ $comment }}"</p>
            </div>
        @endif

        <p>Puedes ver los detalles de tu pedido y realizar el seguimiento en tiempo real desde tu cuenta:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/cuenta/pedidos/{{ $order->id }}" style="background: #2563eb; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mi Pedido</a>
        </div>

        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

        <div class="footer">
            <p>&copy; {{ date('Y') }} Garabito Shop RD. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
