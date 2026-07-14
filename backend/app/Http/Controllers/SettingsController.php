<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use App\Services\Cloudinary\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    protected $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    public function index()
    {
        try {
            $defaults = [
                'general' => [
                    'storeName' => 'Garabito Shop',
                    'slogan' => '',
                    'contactEmail' => '',
                    'supportPhone' => '',
                    'logoLight' => null,
                    'logoDark' => null,
                    'bankAccounts' => []
                ],
                'payments' => [
                    'azulActive' => false,
                    'cardnetActive' => false,
                    'paypalActive' => false,
                    'transferActive' => false
                ],
                'inventory' => [
                    'autoDisableNoStock' => true,
                    'hideOutOfStock' => true
                ],
                'shipping' => [
                    'zones' => []
                ],
                'notifications' => [
                    'orderEmails' => false,
                    'stockAlerts' => false,
                    'newCustomers' => false
                ],
                'security' => [
                    'twoFactorAuth' => false,
                    'sessionTimeout' => 30,
                    'passwordExpiration' => 90,
                    'failedAttemptsLimit' => 5
                ],
                'email' => [
                    'provider' => 'smtp',
                    'fromName' => '',
                    'fromEmail' => '',
                    'marketingNewsletter' => false
                ],
            ];

            $settings = StoreSetting::all()->pluck('value', 'key')->toArray();

            $result = [];
            foreach ($defaults as $key => $defaultValue) {
                if (isset($settings[$key])) {
                    // Merge DB values with defaults to ensure all sub-keys exist
                    $result[$key] = is_array($settings[$key])
                        ? array_merge($defaultValue, $settings[$key])
                        : $settings[$key];
                } else {
                    $result[$key] = $defaultValue;
                }
            }

            return response()->json($result);
        } catch (\Exception $e) {
            Log::error("Error en Settings index: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            // Recibimos los datos directamente en el body o bajo la clave 'settings'
            $settingsData = $request->has('settings')
                ? (is_string($request->input('settings')) ? json_decode($request->input('settings'), true) : $request->input('settings'))
                : $request->except(['logo_light', 'logo_dark', '_token', '_method']);

            if (empty($settingsData) && !$request->hasFile('logo_light') && !$request->hasFile('logo_dark')) {
                return response()->json(['message' => 'No se recibieron datos'], 422);
            }

            // Procesar logos si existen - Subida a Cloudinary
            if ($request->hasFile('logo_light')) {
                $settingsData['general']['logoLight'] = $this->cloudinary->upload($request->file('logo_light'), 'logos');
            }
            if ($request->hasFile('logo_dark')) {
                $settingsData['general']['logoDark'] = $this->cloudinary->upload($request->file('logo_dark'), 'logos');
            }

            // Procesar logos de bancos si existen - Subida a Cloudinary
            if (isset($settingsData['general']['bankAccounts'])) {
                $existingSettings = StoreSetting::where('key', 'general')->first();
                $existingGeneral = $existingSettings ? $existingSettings->value : [];
                $existingBanks = $existingGeneral['bankAccounts'] ?? [];

                foreach ($settingsData['general']['bankAccounts'] as &$bank) {
                    $fileKey = 'bank_logo_' . $bank['id'];
                    if ($request->hasFile($fileKey)) {
                        $bank['bankLogo'] = $this->cloudinary->upload($request->file($fileKey), 'bank_logos');
                    } else {
                        // Si no hay archivo nuevo, intentar mantener el logo anterior buscando por ID
                        foreach ($existingBanks as $existingBank) {
                            if ($existingBank['id'] === $bank['id'] && isset($existingBank['bankLogo'])) {
                                $bank['bankLogo'] = $existingBank['bankLogo'];
                                break;
                            }
                        }
                    }
                }
            }

            $validKeys = ['general', 'inventory', 'payments', 'shipping', 'notifications', 'security', 'email'];

            foreach ($settingsData as $key => $value) {
                if (in_array($key, $validKeys)) {
                    StoreSetting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value]
                    );
                }
            }

            return response()->json([
                'message' => 'Configuración actualizada exitosamente',
                'settings' => $settingsData
            ]);
        } catch (\Exception $e) {
            Log::error("Error en Settings update: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
