<?php

namespace App\Services;

use App\Models\NCFRecord;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class NCFService
{
    /**
     * Types of NCF in Dominican Republic
     */
    const TYPE_CREDITO_FISCAL = '01';
    const TYPE_CONSUMIDOR_FINAL = '02';
    const TYPE_REGIMENES_ESPECIALES = '14';
    const TYPE_GUBERNAMENTAL = '15';

    /**
     * Issue an NCF for an order
     */
    public function issueNCF(Order $order, $type = self::TYPE_CONSUMIDOR_FINAL, $rnc = null, $businessName = null)
    {
        return DB::transaction(function () use ($order, $type, $rnc, $businessName) {
            // Check if already issued
            if ($order->ncfRecord) {
                return $order->ncfRecord;
            }

            // Get next sequence (in production this comes from a managed table or external API)
            $lastNCF = NCFRecord::where('ncf_type', $type)->orderBy('id', 'desc')->first();
            $sequence = $lastNCF ? (int) substr($lastNCF->ncf, 2) + 1 : 1;

            $ncfNumber = $type . str_pad($sequence, 8, '0', STR_PAD_LEFT);

            $ncfRecord = NCFRecord::create([
                'order_id' => $order->id,
                'ncf' => $ncfNumber,
                'ncf_type' => $type,
                'issued_date' => now(),
                'amount' => $order->total,
                'status' => 'issued',
                'rnc_cedula' => $rnc,
                'business_name' => $businessName,
            ]);

            return $ncfRecord;
        });
    }
}
