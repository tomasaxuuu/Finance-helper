<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExportController;
use App\Http\Middleware\CorsMiddleware;
use App\Http\Controllers\AdviceController;
use App\Http\Controllers\TransactionImportController;

// Открытые маршруты (регистрация и логин) с CORS
Route::middleware([CorsMiddleware::class])->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/advice', [AdviceController::class, 'generate']);
});

// Защищенные маршруты (только для авторизованных пользователей)
Route::middleware(['auth:sanctum', CorsMiddleware::class])->group(function () {
    // Работа с пользователем
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'update']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Работа с транзакциями
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update']);

    // Работа с категориями
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Аналитика
    Route::get('/analytics', [TransactionController::class, 'analytics']);
    Route::get('/analytics/monthly', [TransactionController::class, 'monthlyAnalytics']);

    // Экспорт PDF
    Route::get('/transactions/export/pdf', [TransactionController::class, 'exportPdf']);
    // routes/api.php
    Route::post('/import-pdf', [TransactionImportController::class, 'import']);
});
