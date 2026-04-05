<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'roles' => $user->getRoleNames()->values()->all(),
            ],
        ];

        if ($user->hasRole('admin')) {
            $data = array_merge($data, $this->getAdminStats());
        } elseif ($user->hasRole('gestionnaire_stock')) {
            $data = array_merge($data, $this->getStockStats());
        } elseif ($user->hasRole('vendeur')) {
            $data = array_merge($data, $this->getSellerStats($user->id));
        } elseif ($user->hasRole('caissier')) {
            $data = array_merge($data, $this->getCashierStats($user));
        }

        return response()->json($data);
    }

    private function getAdminStats(): array
    {
        return [
            'total_articles' => Article::count(),
            'low_stock_articles' => Article::lowStock()->count(),
            'today_sales' => (float) Sale::today()->paid()->sum('total_amount'),
            'today_sales_count' => Sale::today()->paid()->count(),
            'month_sales' => (float) Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->paid()
                ->sum('total_amount'),
            'recent_sales' => Sale::with(['user:id,name', 'items.article:id,name'])
                ->latest()
                ->take(5)
                ->get(),
            'recent_movements' => StockMovement::with(['article:id,name', 'user:id,name'])
                ->latest()
                ->take(5)
                ->get(),
            'expiring_articles' => Article::expiringSoon()->take(5)->get(),
        ];
    }

    private function getStockStats(): array
    {
        return [
            'total_articles' => Article::count(),
            'active_articles' => Article::active()->count(),
            'low_stock_articles' => Article::lowStock()->with('category:id,name')->get(),
            'expiring_articles' => Article::expiringSoon()->with('category:id,name')->get(),
            'expired_articles' => Article::expired()->with('category:id,name')->get(),
            'recent_movements' => StockMovement::with(['article:id,name', 'user:id,name'])
                ->latest()
                ->take(10)
                ->get(),
            'today_movements' => StockMovement::whereDate('created_at', today())->count(),
        ];
    }

    private function getSellerStats(int $userId): array
    {
        return [
            'today_sales' => (float) Sale::byUser($userId)->today()->paid()->sum('total_amount'),
            'today_sales_count' => Sale::byUser($userId)->today()->paid()->count(),
            'month_sales' => (float) Sale::byUser($userId)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->paid()
                ->sum('total_amount'),
            'recent_sales' => Sale::byUser($userId)
                ->with(['items.article:id,name'])
                ->latest()
                ->take(5)
                ->get(),
        ];
    }

    private function getCashierStats($user): array
    {
        $openRegister = $user->getOpenCashRegister();

        return [
            'open_register' => $openRegister?->load(['inputs.sale.user', 'outputs.user', 'user']),
            'has_open_register' => $openRegister !== null,
            'today_registers' => CashRegister::query()
                ->forOrganization($user->organization_id)
                ->today()
                ->get(),
            'recent_registers' => CashRegister::query()
                ->forOrganization($user->organization_id)
                ->latest('date')
                ->take(5)
                ->get(),
        ];
    }
}
