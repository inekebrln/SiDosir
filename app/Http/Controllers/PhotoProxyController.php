<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class PhotoProxyController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $url = $request->query('url');

        if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
            abort(404);
        }

        try {
            // Ambil gambar dari ImgBB menggunakan koneksi backend Laravel (bebas blokir Telkomsel Internet Baik)
            $response = Http::withOptions([
                'verify' => false,
            ])->timeout(10)->get($url);

            if ($response->successful()) {
                $contentType = $response->header('Content-Type') ?? 'image/jpeg';
                return response($response->body(), 200, [
                    'Content-Type' => $contentType,
                    'Cache-Control' => 'public, max-age=86400',
                ]);
            }
        } catch (\Throwable $e) {
            \Log::error('PhotoProxy Error: ' . $e->getMessage());
        }

        abort(404);
    }
}
