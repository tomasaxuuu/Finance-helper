<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;

class AdviceController extends Controller
{
    public function generate(Request $request)
    {
        try {
            $transactions = $request->input('transactions');

            if (!$transactions || !is_array($transactions)) {
                return response()->json(['error' => 'transactions not provided'], 400);
            }

            $client = new Client([
                'verify' => 'D:/cacert.pem', // если нужно
            ]);

            $response = $client->post('https://openrouter.ai/api/v1/chat/completions', [
                'headers' => [
                    'Authorization' => 'Bearer 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',
                    'Content-Type' => 'application/json',
                    'HTTP-Referer' => 'https://yourproject.example.com', // любой URL
                    'X-Title' => 'Budget Advisor'
                ],
                'json' => [
                    'model' => 'openai/gpt-4', // или другая поддерживаемая модель
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => 'Ты финансовый советник. На основе списка транзакций в JSON дай 3–5 советов по оптимизации бюджета пользователя. Отвечай на русском. Вот транзакции: ' . json_encode(array_slice($transactions, 0, 30)),
                        ],
                    ],
                    'max_tokens' => 64
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'OpenRouter API error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
