<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $query = $request->user()->transactions()->with('category')->orderBy('date', 'desc');

        // Поиск по тексту
        if ($request->has('search')) {
            $query->where('note', 'like', '%' . $request->search . '%');
        }

        // Фильтр по типу
        if ($request->has('type') && in_array($request->type, ['income', 'expense'])) {
            $query->where('type', $request->type);
        }

        // Фильтр по категории
        if ($request->has('category_id') && is_numeric($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Фильтр по дате
        if ($request->has('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        return response()->json($query->get());
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:255',
            'date' => 'nullable|date',
        ]);

        $transaction = $request->user()->transactions()->create([
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'note' => $validated['note'] ?? null,
            'date' => $validated['date'] ?? now(),
        ]);

        return response()->json($transaction, 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction); // Не забудь политику!

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $transaction->update($validated);

        return response()->json($transaction);
    }
    public function analytics(Request $request)
    {
        $query = $request->user()->transactions();

        // Фильтрация по дате
        if ($request->has('from')) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        // Получаем суммы по типам
        $income = (clone $query)->where('type', 'income')->sum('amount');
        $expense = (clone $query)->where('type', 'expense')->sum('amount');

        return response()->json([
            'income' => $income,
            'expense' => $expense,
            'balance' => $income - $expense,
        ]);
    }
    public function monthlyAnalytics(Request $request)
    {
        $userId = $request->user()->id;

        $query = DB::table('transactions')
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as month, 
                     SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                     SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense")
            ->where('user_id', $userId)
            ->groupBy(DB::raw("DATE_FORMAT(date, '%Y-%m')"))
            ->orderBy('month', 'asc');

        // Фильтрация по дате
        if ($request->has('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        $data = $query->get();

        return response()->json($data);
    }
    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction); 
        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}
