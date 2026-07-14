<?php

namespace App\Services\Cloudinary;

use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;

class CloudinaryService
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(
            Configuration::instance([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ],
                'url' => [
                    'secure' => true
                ]
            ])
        );
    }

    /**
     * Sube una imagen a Cloudinary.
     *
     * @param \Illuminate\Http\UploadedFile|string $file
     * @param string $folder
     * @return string URL de la imagen subida
     */
    public function upload($file, $folder = 'products')
    {
        $filePath = is_string($file) ? $file : $file->getRealPath();

        $response = $this->cloudinary->uploadApi()->upload($filePath, [
            'folder' => 'garabito_shop/' . $folder,
            'resource_type' => 'auto'
        ]);

        return $response['secure_url'];
    }

    /**
     * Elimina una imagen de Cloudinary.
     *
     * @param string $publicId
     * @return bool
     */
    public function delete($publicId)
    {
        try {
            $this->cloudinary->uploadApi()->destroy($publicId);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
