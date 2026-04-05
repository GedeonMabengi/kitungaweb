<?php
// app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\StockMovement;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        $data = [
            'user' => $user->load('roles'),
        ];

        if ($user->hasRole('admin')) {
            $data = array_merge($data, $this->getAdminStats());
        } elseif ($user->hasRole('gestionnaire_stock')) {
            $data = array_merge($data, $this->getStockStats());
        } elseif ($user->hasRole('vendeur')) {
            $data = array_merge($data, $this->getSellerStats());
        } elseif ($user->hasRole('caissier')) {
            $data = array_merge($data, $this->getCashierStats());
        }

        return Inertia::render('Dashboard', $data);
    }

    private function getAdminStats(): array
    {
        return [
            'totalArticles' => Article::count(),
            'lowStockArticles' => Article::lowStock()->count(),
            'todaySales' => Sale::today()->paid()->sum('total_amount'),
            'todaySalesCount' => Sale::today()->paid()->count(),
            'monthSales' => Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->paid()
                ->sum('total_amount'),
            'recentSales' => Sale::with('user', 'items.article')
                ->latest()
                ->take(5)
                ->get(),
            'recentMovements' => StockMovement::with('article', 'user')
                ->latest()
                ->take(5)
                ->get(),
            'expiringArticles' => Article::expiringSoon()->take(5)->get(),
        ];
    }

    private function getStockStats(): array
    {
        return [
            'totalArticles' => Article::count(),
            'activeArticles' => Article::active()->count(),
            'lowStockArticles' => Article::lowStock()->get(),
            'expiringArticles' => Article::expiringSoon()->get(),
            'expiredArticles' => Article::expired()->get(),
            'recentMovements' => StockMovement::with('article', 'user')
                ->latest()
                ->take(10)
                ->get(),
            'todayMovements' => StockMovement::whereDate('created_at', today())->count(),
        ];
    }

    private function getSellerStats(): array
    {
        $user = auth()->user();

        return [
            'todaySales' => Sale::byUser($user->id)->today()->paid()->sum('total_amount'),
            'todaySalesCount' => Sale::byUser($user->id)->today()->paid()->count(),
            'monthSales' => Sale::byUser($user->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->paid()
                ->sum('total_amount'),
            'recentSales' => Sale::byUser($user->id)
                ->with('items.article')
                ->latest()
                ->take(5)
                ->get(),
        ];
    }

    private function getCashierStats(): array
    {
        $user = auth()->user();
        $openRegister = $user->getOpenCashRegister();

        return [
            'openRegister' => $openRegister?->load('inputs.sale', 'outputs'),
            'hasOpenRegister' => $openRegister !== null,
            'todayRegisters' => CashRegister::query()
                ->forOrganization($user->organization_id)
                ->today()
                ->get(),
            'recentRegisters' => CashRegister::query()
                ->forOrganization($user->organization_id)
                ->latest('date')
                ->take(5)
                ->get(),
        ];
    }
}
