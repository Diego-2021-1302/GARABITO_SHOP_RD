<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CardnetPaymentGateway implements PaymentGatewayInterface
{
    private ?string $merchantId;
    private ?string $merchantPassword;
    private string $apiUrl;

    public function __construct()
    {
        $this->merchantId = config('payment.cardnet.merchant_id');
        $this->merchantPassword = config('payment.cardnet.merchant_password');
        $this->apiUrl = config('payment.cardnet.environment') === 'production'
            ? 'https://api.cardnet.com.do/v1'
            : 'https://test.cardnet.com.do/v1';
    }

    public function process(array $data): array
    {
        try {
            $payload = [
                'MerchantId' => $this->merchantId,
                'MerchantPassword' => $this->merchantPassword,
                'OrderId' => $data['order_number'],
                'Amount' => number_format($data['amount'], 2, '.', ''),
                'Currency' => $data['currency'] ?? 'DOP',
                'CardNumber' => str_replace(' ', '', $data['card_number']),
                'ExpiryDate' => $data['expiration'],
                'CVV' => $data['cvv'],
                'CardholderName' => $data['cardholder_name'],
                'ClientIPAddress' => request()->ip(),
            ];

            $response = Http::post($this->apiUrl . '/Process', $payload);

            if ($response->failed()) {
                Log::error('Cardnet Payment Failed', ['status' => $response->status(), 'body' => $response->body()]);
                return ['success' => false, 'message' => 'Error de comunicación con Cardnet.'];
            }

            $result = $response->json();

            return [
                'success' => isset($result['RespCode']) && $result['RespCode'] == '00',
                'transaction_id' => $result['TraceNumber'] ?? null,
                'reference_number' => $result['ReferenceNumber'] ?? null,
                'message' => $result['RespMessage'] ?? 'Error desconocido',
                'data' => $result,
            ];
        } catch (\Exception $e) {
            Log::critical('Cardnet Exception', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Error al procesar el pago con Cardnet.'];
        }
    }

    public function verify(string $transactionId): array
    {
        $response = Http::post($this->apiUrl . '/Verify', [
            'MerchantId' => $this->merchantId,
            'TraceNumber' => $transactionId,
        ]);

        $result = $response->json();

        return [
            'verified' => isset($result['RespCode']) && $result['RespCode'] == '00',
            'status' => $result['RespMessage'] ?? 'Unknown',
            'data' => $result,
        ];
    }

    public function refund(string $transactionId, float $amount): array
    {
        $response = Http::post($this->apiUrl . '/Refund', [
            'MerchantId' => $this->merchantId,
            'MerchantPassword' => $this->merchantPassword,
            'TraceNumber' => $transactionId,
            'Amount' => number_format($amount, 2, '.', ''),
        ]);

        $result = $response->json();

        return [
            'success' => isset($result['RespCode']) && $result['RespCode'] == '00',
            'message' => $result['RespMessage'] ?? 'Refund processed',
            'data' => $result,
        ];
    }
}
