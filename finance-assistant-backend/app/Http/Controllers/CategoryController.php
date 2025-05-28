<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::where('user_id', Auth::id())->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $category = Category::firstOrCreate([
            'name' => $request->name,
            'user_id' => Auth::id()
        ]);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $category->delete();

        return response()->json(['message' => 'Категория удалена']);
    }
}
