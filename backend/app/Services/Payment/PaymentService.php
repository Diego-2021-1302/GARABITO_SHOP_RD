<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\Payment\Gateways\AzulPaymentGateway;
use App\Services\Payment\Gateways\CardnetPaymentGateway;
use App\Services\Payment\Gateways\VisanetPaymentGateway;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    private array $gateways = [];

    public function __construct()
    {
        $this->gateways = [
            'azul' => new AzulPaymentGateway(),
            'cardnet' => new CardnetPaymentGateway(),
            'visanet' => new VisanetPaymentGateway(),
        ];
    }

    /**
     * Process payment for an order
     */
    public function processPayment(Order $order, array $paymentData): array
    {
        try {
            // Validate payment method
            if (!isset($this->gateways[$order->payment_method])) {
                return [
                    'success' => false,
                    'message' => 'Invalid payment method',
                ];
            }

            $gateway = $this->gateways[$order->payment_method];

            // Prepare payment data
            $data = [
                'amount' => $order->total,
                'currency' => 'DOP',
                'order_number' => $order->order_number,
                'itbis' => $order->itbis,
                'cardholder_name' => $paymentData['cardholder_name'],
                'card_number' => $paymentData['card_number'],
                'expiration' => $paymentData['expiration'],
                'cvv' => $paymentData['cvv'],
                'email' => $paymentData['email'] ?? $order->user->email,
            ];

            // Process payment
            $response = $gateway->process($data);

            if ($response['success']) {
                // Create payment transaction
                $transaction = PaymentTransaction::create([
                    'order_id' => $order->id,
                    'amount' => $order->total,
                    'currency' => 'DOP',
                    'payment_method' => $order->payment_method,
                    'status' => PaymentTransaction::STATUS_COMPLETED,
                    'transaction_id' => $response['transaction_id'],
                    'reference_number' => $response['reference_number'],
                    'response_data' => $response['data'],
                ]);

                // Update order status
                $order->update([
                    'payment_status' => Order::PAYMENT_STATUS_COMPLETED,
                    'status' => Order::STATUS_PAID_CONFIRMED,
                    'paid_at' => now(),
                ]);

                // Descontar stock para pagos con tarjeta exitosos
                $inventoryService = app(\App\Services\Inventory\InventoryService::class);
                $inventoryService->finalizeOrderStockExit($order);

                Log::info('Payment processed successfully', [
                    'order_id' => $order->id,
                    'transaction_id' => $response['transaction_id'],
                ]);

                return [
                    'success' => true,
                    'message' => 'Payment processed successfully',
                    'transaction_id' => $transaction->id,
                ];
            } else {
                // Create failed transaction record
                PaymentTransaction::create([
                    'order_id' => $order->id,
                    'amount' => $order->total,
                    'currency' => 'DOP',
                    'payment_method' => $order->payment_method,
                    'status' => PaymentTransaction::STATUS_FAILED,
                    'error_message' => $response['message'],
                    'response_data' => $response['data'],
                ]);

                // Update order status
                $order->update([
                    'payment_status' => Order::PAYMENT_STATUS_FAILED,
                ]);

                Log::error('Payment failed', [
                    'order_id' => $order->id,
                    'message' => $response['message'],
                ]);

                return [
                    'success' => false,
                    'message' => $response['message'],
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment exception', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Payment processing error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Refund payment
     */
    public function refundPayment(Order $order, float $amount): array
    {
        try {
            $transaction = $order->paymentTransaction;

            if (!$transaction) {
                return [
                    'success' => false,
                    'message' => 'No payment transaction found',
                ];
            }

            if (!isset($this->gateways[$transaction->payment_method])) {
                return [
                    'success' => false,
                    'message' => 'Invalid payment method',
                ];
            }

            $gateway = $this->gateways[$transaction->payment_method];
            $response = $gateway->refund($transaction->transaction_id, $amount);

            if ($response['success']) {
                // Update transaction status
                $transaction->update([
                    'status' => PaymentTransaction::STATUS_REFUNDED,
                ]);

                Log::info('Payment refunded successfully', [
                    'order_id' => $order->id,
                    'amount' => $amount,
                ]);

                return [
                    'success' => true,
                    'message' => 'Refund processed successfully',
                ];
            } else {
                Log::error('Refund failed', [
                    'order_id' => $order->id,
                    'message' => $response['message'],
                ]);

                return [
                    'success' => false,
                    'message' => $response['message'],
                ];
            }
        } catch (\Exception $e) {
            Log::error('Refund exception', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Refund processing error: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Verify payment status
     */
    public function verifyPayment(PaymentTransaction $transaction): array
    {
        try {
            if (!isset($this->gateways[$transaction->payment_method])) {
                return [
                    'verified' => false,
                    'message' => 'Invalid payment method',
                ];
            }

            $gateway = $this->gateways[$transaction->payment_method];
            $response = $gateway->verify($transaction->transaction_id);

            if ($response['verified'] && $transaction->status === PaymentTransaction::STATUS_PENDING) {
                $transaction->update(['status' => PaymentTransaction::STATUS_COMPLETED]);
            }

            return $response;
        } catch (\Exception $e) {
            Log::error('Payment verification exception', [
                'transaction_id' => $transaction->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'verified' => false,
                'message' => 'Verification error: ' . $e->getMessage(),
            ];
        }
    }
}
