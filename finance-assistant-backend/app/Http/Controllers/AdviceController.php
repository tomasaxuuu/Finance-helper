<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AdviceController extends Controller
{
    public function generate(Request $request)
    {
        try {
            $type = $request->input('type', 'transactions');
            $data = $request->input('data', []);
            $transactions = $request->input('transactions', []);

            $prompt = match ($type) {
                'budget' => "Ты финансовый советник. Баланс: {$data['balance']}₽. Доходы: {$data['income']}₽. Расходы: {$data['expense']}₽. Дай советы по управлению бюджетом. Не используй списки, markdown-разметку, символы **, ###, -, цифры с точками и буллеты. Пиши обычными абзацами.",
                'operations' => "Ты финансовый советник. Вот последние операции пользователя: " . json_encode($data['last'], JSON_UNESCAPED_UNICODE) . ". Проанализируй их и дай советы. Не используй markdown, списки, нумерацию или символы **, -, ###.",
                'piggybank' => "Ты финансовый советник. В копилке пользователя {$data['piggybank']}₽. Что ты можешь порекомендовать? Пиши без списков и markdown.",
                'activity' => "Ты финансовый советник. Пользователь был активен в следующие даты: " . implode(', ', $data['dates']) . ". Что можно посоветовать? Напиши рекомендации абзацами, без пунктов и markdown.",
                'categories' => "Ты финансовый советник. Вот категории расходов: " . implode(', ', $data['categories']) . ". Дай советы по оптимизации в форме текста без списков и форматирования.",
                'summary' => "Ты финансовый советник. Вот все транзакции пользователя: " . json_encode($data['all'], JSON_UNESCAPED_UNICODE) . ". Дай сводные рекомендации без списков, markdown, заголовков или символов **, -, ###.",
                default => "Ты финансовый советник. Вот список транзакций: " . json_encode(array_slice($transactions, 0, 30), JSON_UNESCAPED_UNICODE) . ". Дай 3–5 советов по оптимизации бюджета. Пиши абзацами, без пунктов, markdown и спецсимволов."
            };


            $accessToken = $this->getAccessToken();
            if (!$accessToken) {
                return response()->json(['error' => 'Access token not received'], 500);
            }

            $client = new Client(['verify' => false]);
            $response = $client->post('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $accessToken,
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ],
                'json' => [
                    'model' => 'GigaChat:latest',
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.7,
                    'max_tokens' => 2000,
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('GigaChat API error: ' . $e->getMessage());
            return response()->json([
                'error' => 'GigaChat API error',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    private function getAccessToken()
    {
        if (Cache::has('gigachat_token')) {
            return Cache::get('gigachat_token');
        }

        $client = new Client(['verify' => false]);

        $clientId = '29e42e1c-4418-4656-bdb6-badd17d6221f';
        $clientSecret = 'dc879360-3d8d-4cb8-8351-e1b349051202';
        if (!$clientId || !$clientSecret) {
            Log::error('GigaChat client_id или client_secret не заданы');
            return null;
        }

        try {
            $response = $client->post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', [
                'headers' => [
                    'Content-Type' => 'application/x-www-form-urlencoded',
                    'Accept' => 'application/json',
                    'RqUID' => (string) Str::uuid(),
                    'Authorization' => 'Basic ' . base64_encode($clientId . ':' . $clientSecret),
                ],
                'form_params' => [
                    'scope' => 'GIGACHAT_API_PERS',
                ],
            ]);

            $body = json_decode($response->getBody(), true);
            Log::info('Ответ от GigaChat OAuth:', $body);

            if (!empty($body['access_token'])) {
                Cache::put('gigachat_token', $body['access_token'], now()->addMinutes(29));
                return $body['access_token'];
            } else {
                Log::error('GigaChat OAuth вернул тело без access_token', $body);
            }
        } catch (\Exception $e) {
            Log::error('Ошибка получения токена GigaChat: ' . $e->getMessage());

            if ($e instanceof \GuzzleHttp\Exception\RequestException) {
                $response = $e->getResponse();
                if ($response) {
                    Log::error('GigaChat OAuth response body: ' . $response->getBody()->getContents());
                }
            }
        }

        return null;
    }
}
