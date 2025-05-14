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
        $query = $request->user()
            ->transactions()
            ->with('category') // Загружаем категорию
            ->orderBy('date', 'desc');

        if ($request->has('search')) {
            $query->where('note', 'like', '%' . $request->search . '%');
        }

        if ($request->has('type') && in_array($request->type, ['income', 'expense'])) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id') && is_numeric($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        // Возвращаем массив транзакций
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $transaction = $request->user()->transactions()->create($validated);

        return response()->json($transaction->load('category'), 201);
    }



    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $transaction->update($validated);

        return response()->json($transaction->load('category')); // Вернём с категорией
    }

    public function analytics(Request $request)
    {
        $query = $request->user()->transactions();

        if ($request->has('from')) {
            $query->whereDate('date', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

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

        if ($request->has('from')) {
            $query->whereDate('date', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->whereDate('date', '<=', $request->to);
        }

        return response()->json($query->get());
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        $transaction->delete();

        return response()->json(['message' => 'Transaction deleted successfully']);
    }
}
