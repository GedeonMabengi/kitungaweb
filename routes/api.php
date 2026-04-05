<?php

use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\ArticleController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CashRegisterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\StockMovementController;
use Illuminate\Support\Facades\Route;

Route::name('api.')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->name('login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('/user', [AuthController::class, 'user'])->name('user');

        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/organization', [OrganizationController::class, 'show'])->name('organization.show');
        Route::patch('/organization', [OrganizationController::class, 'update'])->name('organization.update');

        Route::apiResource('categories', CategoryController::class);

        Route::get('/articles/low-stock', [ArticleController::class, 'lowStock'])->name('articles.low-stock');
        Route::get('/articles/expiring', [ArticleController::class, 'expiring'])->name('articles.expiring');
        Route::post('/articles/{article}/adjust-stock', [ArticleController::class, 'adjustStock'])->name('articles.adjust-stock');
        Route::apiResource('articles', ArticleController::class);

        Route::apiResource('stock-movements', StockMovementController::class)
            ->only(['index', 'store', 'show']);

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/sales', [ReportController::class, 'sales'])->name('reports.sales');
        Route::get('/reports/stock', [ReportController::class, 'stock'])->name('reports.stock');
        Route::get('/reports/cash', [ReportController::class, 'cash'])->name('reports.cash');

        Route::get('/sales/today-stats', [SaleController::class, 'todayStats'])->name('sales.today-stats');
        Route::post('/sales/{sale}/cancel', [SaleController::class, 'cancel'])->name('sales.cancel');
        Route::apiResource('sales', SaleController::class)->only(['index', 'store', 'show']);

        Route::get('/cash-registers/current', [CashRegisterController::class, 'current'])->name('cash-registers.current');
        Route::post('/cash-registers/open', [CashRegisterController::class, 'open'])->name('cash-registers.open');
        Route::post('/cash-registers/{cashRegister}/close', [CashRegisterController::class, 'close'])->name('cash-registers.close');
        Route::post('/cash-registers/{cashRegister}/input', [CashRegisterController::class, 'addInput'])->name('cash-registers.input');
        Route::post('/cash-registers/{cashRegister}/output', [CashRegisterController::class, 'addOutput'])->name('cash-registers.output');
        Route::apiResource('cash-registers', CashRegisterController::class)
            ->only(['index', 'show']);

        Route::middleware('role:admin')->group(function () {
            Route::post('/users/{user}/toggle-active', [AdminUserController::class, 'toggleActive'])->name('users.toggle-active');
            Route::apiResource('users', AdminUserController::class);
        });
    });
});
