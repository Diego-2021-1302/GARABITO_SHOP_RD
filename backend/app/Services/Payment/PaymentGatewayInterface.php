<?php

namespace App\Services\Payment;

use App\Models\PaymentTransaction;

interface PaymentGatewayInterface
{
    /**
     * Process payment
     *
     * @param array $data Payment data
     * @return array Response with transaction details
     */
    public function process(array $data): array;

    /**
     * Verify payment
     *
     * @param string $transactionId Transaction ID
     * @return array Verification response
     */
    public function verify(string $transactionId): array;

    /**
     * Refund payment
     *
     * @param string $transactionId Transaction ID
     * @param float $amount Amount to refund
     * @return array Refund response
     */
    public function refund(string $transactionId, float $amount): array;
}
