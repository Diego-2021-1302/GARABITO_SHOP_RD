<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'shipping_cost',
        'total',
        'payment_method',
        'payment_status',
        'payment_proof',
        'amount_paid',
        'issuing_bank',
        'transaction_reference',
        'proof_uploaded_at',
        'shipping_address_id',
        'billing_address_id',
        'notes',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'paid_at',
        'preparing_at',
        'ready_for_shipping_at',
        'invoice_pdf_path',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'total' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'paid_at' => 'datetime',
        'preparing_at' => 'datetime',
        'ready_for_shipping_at' => 'datetime',
        'proof_uploaded_at' => 'datetime',
    ];

    // Estados oficiales del pedido (ÚNICAMENTE estos 8)
    const STATUS_PENDING_PAYMENT = 'pendiente_pago';      // Pendiente de Pago
    const STATUS_PROOF_SUBMITTED = 'comprobante_subido'; // Comprobante Subido
    const STATUS_PAID_CONFIRMED = 'pago_confirmado';     // Pago Confirmado
    const STATUS_PREPARING = 'preparando';               // Preparando
    const STATUS_READY_FOR_SHIPPING = 'listo_envio';      // Listo para Envío
    const STATUS_ON_WAY = 'en_camino';                   // En Camino
    const STATUS_DELIVERED = 'entregado';                // Entregado
    const STATUS_CANCELLED = 'cancelado';                // Cancelado

    const PAYMENT_STATUS_PENDING = 'pending';
    const PAYMENT_STATUS_COMPLETED = 'completed';
    const PAYMENT_STATUS_FAILED = 'failed';
    const PAYMENT_STATUS_REFUNDED = 'refunded';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function shippingAddress()
    {
        return $this->belongsTo(Address::class, 'shipping_address_id');
    }

    public function billingAddress()
    {
        return $this->belongsTo(Address::class, 'billing_address_id');
    }

    public function shipment()
    {
        return $this->hasOne(Shipment::class);
    }

    public function paymentTransaction()
    {
        return $this->hasOne(PaymentTransaction::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function ncfRecord()
    {
        return $this->hasOne(NCFRecord::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Define el orden lógico del flujo para validaciones
     */
    public static function getStatusFlow()
    {
        return [
            self::STATUS_PENDING_PAYMENT,
            self::STATUS_PROOF_SUBMITTED,
            self::STATUS_PAID_CONFIRMED,
            self::STATUS_PREPARING,
            self::STATUS_READY_FOR_SHIPPING,
            self::STATUS_ON_WAY,
            self::STATUS_DELIVERED,
        ];
    }

    /**
     * Obtiene el siguiente estado lógico
     */
    public function getNextStatus()
    {
        $flow = self::getStatusFlow();
        $currentIndex = array_search($this->status, $flow);

        if ($currentIndex === false || $currentIndex === count($flow) - 1) {
            return null;
        }

        return $flow[$currentIndex + 1];
    }

    /**
     * Valida si se puede cambiar al nuevo estado
     */
    public function canChangeToStatus(string $newStatus)
    {
        if ($newStatus === self::STATUS_CANCELLED) {
            return !in_array($this->status, [self::STATUS_DELIVERED, self::STATUS_CANCELLED]);
        }

        // Si es efectivo (COD), permitimos saltar a "Preparando" desde "Pendiente de Pago"
        if ($this->payment_method === 'cod' && $this->status === self::STATUS_PENDING_PAYMENT && $newStatus === self::STATUS_PREPARING) {
            return true;
        }

        $nextStatus = $this->getNextStatus();
        return $newStatus === $nextStatus;
    }
}
