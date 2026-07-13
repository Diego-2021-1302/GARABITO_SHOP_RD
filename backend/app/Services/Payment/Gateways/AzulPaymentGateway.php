<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AzulPaymentGateway implements PaymentGatewayInterface
{
    private ?string $storeId;
    private ?string $merchantAuth;
    private ?string $apiKey;
    private string $apiUrl;

    public function __construct()
    {
        $this->storeId = config('payment.azul.store_id');
        $this->merchantAuth = config('payment.azul.merchant_auth_key');
        $this->apiKey = config('payment.azul.api_key');
        $this->apiUrl = config('payment.azul.environment') === 'production'
            ? 'https://api.azul.com.do/api/1.0'
            : 'https://test.azul.com.do/api/1.0';
    }

    public function process(array $data): array
    {
        try {
            $payload = [
                'StoreId' => $this->storeId,
                'Channel' => 'Web',
                'Amount' => $data['amount'],
                'Currency' => $data['currency'] ?? 'DOP',
                'OrderNumber' => $data['order_number'],
                'PosReferenceNumber' => $data['reference'] ?? uniqid(),
                'CardNumber' => $data['card_number'],
                'Expiration' => $data['expiration'],
                'CVC' => $data['cvv'],
                'CardholderName' => $data['cardholder_name'],
                'ECommerceIndicator' => '2',
                'TaxAmount' => $data['itbis'] ?? 0,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->storeId . ':' . $this->merchantAuth),
                'X-Api-Key' => $this->apiKey,
            ])->post($this->apiUrl . '/Transaction/Process', $payload);

            if ($response->failed()) {
                Log::error('Azul Payment Failed', ['status' => $response->status(), 'body' => $response->body()]);
                return [
                    'success' => false,
                    'message' => 'Error de comunicación con la pasarela de pago.',
                ];
            }

            $result = $response->json();

            return [
                'success' => ($result['ResponseCode'] ?? '') === '00',
                'transaction_id' => $result['IsoResponseCode'] ?? null,
                'reference_number' => $result['ReferenceNumber'] ?? null,
                'message' => $result['ResponseMessage'] ?? 'Error desconocido',
                'data' => $result,
            ];

        } catch (\Exception $e) {
            Log::critical('Azul Payment Exception', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Ocurrió un error inesperado al procesar el pago.',
            ];
        }
    }

    public function verify(string $transactionId): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->storeId . ':' . $this->merchantAuth),
            'X-Api-Key' => $this->apiKey,
        ])->get($this->apiUrl . "/Transaction/Verify/{$transactionId}");

        $result = $response->json();

        return [
            'verified' => ($result['ResponseCode'] ?? '') === '00',
            'status' => $result['ResponseMessage'] ?? 'Unknown',
            'data' => $result,
        ];
    }

    public function refund(string $transactionId, float $amount): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Basic ' . base64_encode($this->storeId . ':' . $this->merchantAuth),
            'X-Api-Key' => $this->apiKey,
        ])->post($this->apiUrl . '/Transaction/Refund', [
            'StoreId' => $this->storeId,
            'ReferenceNumber' => $transactionId,
            'Amount' => $amount,
        ]);

        $result = $response->json();

        return [
            'success' => ($result['ResponseCode'] ?? '') === '00',
            'message' => $result['ResponseMessage'] ?? 'Refund processed',
            'data' => $result,
        ];
    }
}
