<?php

namespace App\Services\Payment\Gateways;

use App\Services\Payment\PaymentGatewayInterface;

class VisanetPaymentGateway implements PaymentGatewayInterface
{
    private ?string $affiliateCode;
    private ?string $affiliatePassword;
    private string $apiUrl = 'https://api.visanet.com.do/api/v1';

    public function __construct()
    {
        $this->affiliateCode = config('payment.visanet.affiliate_code');
        $this->affiliatePassword = config('payment.visanet.affiliate_password');
    }

    /**
     * Process payment via Visanet
     */
    public function process(array $data): array
    {
        try {
            $payload = [
                'AffiliateCode' => $this->affiliateCode ?? '',
                'AffiliatePassword' => $this->affiliatePassword ?? '',
                'TransactionId' => uniqid('TRX_'),
                'Amount' => number_format($data['amount'], 2, '.', ''),
                'Currency' => $data['currency'] ?? 'DOP',
                'OrderNumber' => $data['order_number'],
                'CardNumber' => str_replace(' ', '', $data['card_number']),
                'CardExpiry' => $data['expiration'],
                'CardCvv' => $data['cvv'],
                'CardholderName' => $data['cardholder_name'],
                'Email' => $data['email'] ?? '',
                'IPAddress' => request()->ip(),
            ];

            $response = $this->makeRequest('/payment/charge', $payload);

            return [
                'success' => isset($response['statusCode']) && $response['statusCode'] == '0',
                'transaction_id' => $response['data']['transactionId'] ?? null,
                'reference_number' => $response['data']['referenceCode'] ?? null,
                'message' => $response['statusDescription'] ?? 'Unknown response',
                'data' => $response,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Verify payment
     */
    public function verify(string $transactionId): array
    {
        try {
            $payload = [
                'AffiliateCode' => $this->affiliateCode,
                'TransactionId' => $transactionId,
            ];

            $response = $this->makeRequest('/payment/query', $payload);

            return [
                'verified' => isset($response['statusCode']) && $response['statusCode'] == '0',
                'status' => $response['statusDescription'] ?? 'Unknown',
                'data' => $response,
            ];
        } catch (\Exception $e) {
            return [
                'verified' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Refund payment
     */
    public function refund(string $transactionId, float $amount): array
    {
        try {
            $payload = [
                'AffiliateCode' => $this->affiliateCode,
                'AffiliatePassword' => $this->affiliatePassword,
                'TransactionId' => $transactionId,
                'Amount' => number_format($amount, 2, '.', ''),
            ];

            $response = $this->makeRequest('/payment/refund', $payload);

            return [
                'success' => isset($response['statusCode']) && $response['statusCode'] == '0',
                'message' => $response['statusDescription'] ?? 'Refund processed',
                'data' => $response,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
            ];
        }
    }

    /**
     * Make HTTP request to Visanet API
     */
    private function makeRequest(string $endpoint, array $data): array
    {
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $this->apiUrl . $endpoint,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->affiliatePassword,
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new \Exception("Visanet API error: {$response}");
        }

        return json_decode($response, true) ?? [];
    }
}
