<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Smalot\PdfParser\Parser;
use App\Models\Transaction;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class TransactionImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf',
        ]);

        $incomeCategories = [
            'Пополнение счёта',
            'Внесение наличных',
            'Зачисление средств',
            'Перевод от физлица',
        ];

        $expenseCategories = [
            'Списание',
            'Покупка',
            'Выдача наличных',
            'Оплата услуг',
            'Погашение кредита',
        ];

        $parser = new Parser();
        $pdf = $parser->parseFile($request->file('file')->getPathname());
        $text = $pdf->getText();

        Log::info('📥 Импорт PDF запущен');

        $lines = explode("\n", $text);
        $transactions = [];

        for ($i = 0; $i < count($lines) - 3; $i++) {
            $rawNote = trim($lines[$i + 2]);
            $sumLine = trim($lines[$i + 3]);
            $sumLine = preg_replace('/[\x{00A0}]/u', ' ', $sumLine);

            if (preg_match('/^(\d{2}\.\d{2}\.\d{4})\s+\d{2}:\d{2}.*?([+-]?[0-9\s,]+)\s+[0-9\s,]+$/u', $sumLine, $match)) {
                $dateRaw = $match[1];
                $amountRaw = $match[2];

                try {
                    $date = Carbon::createFromFormat('d.m.Y', $dateRaw)->format('Y-m-d');
                } catch (\Exception $e) {
                    continue;
                }

                $amount = floatval(str_replace([' ', ',', ' '], ['', '.', ''], $amountRaw));
                $type = str_starts_with(trim($amountRaw), '+') ? 'income' : 'expense';

                if (!Auth::check()) continue;

                // 🎯 логичная категория
                $categoryText = $type === 'income'
                    ? $incomeCategories[array_rand($incomeCategories)]
                    : $expenseCategories[array_rand($expenseCategories)];

                $category = Category::firstOrCreate(
                    ['name' => $categoryText, 'user_id' => Auth::id()],
                    ['name' => $categoryText, 'user_id' => Auth::id()]
                );


                // 🧠 логичное описание
                $note = 'Без описания';

                $raw = mb_strtolower($rawNote);

                if ($type === 'income') {
                    if (str_contains($raw, 'перевод от')) {
                        $note = 'Зачисление от клиента';
                    } elseif (str_contains($raw, 'atm')) {
                        $note = 'Пополнение через банкомат';
                    }
                } else {
                    if (str_contains($raw, 'операция по карте')) {
                        $note = 'Оплата картой';
                    } elseif (str_contains($raw, 'перевод')) {
                        $note = 'Перевод средств';
                    } elseif (str_contains($raw, 'atm')) {
                        $note = 'Выдача через банкомат';
                    }
                }

                $transactions[] = [
                    'user_id' => Auth::id(),
                    'category_id' => $category->id,
                    'date' => $date,
                    'note' => $note,
                    'amount' => $amount,
                    'type' => $type,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                $i += 3;
            }
        }

        Log::info(['✅ Импортировано записей' => count($transactions)]);

        if (!empty($transactions)) {
            Transaction::insert($transactions);
        }

        return response()->json(['message' => 'Импортировано: ' . count($transactions)], 200);
    }
}
