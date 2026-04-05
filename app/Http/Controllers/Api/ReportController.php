<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReportFilterRequest;
use App\Models\Article;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\StockMovement;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $reports = array_values(array_filter([
            $this->canAccessSalesReports($user)
                ? [
                    'key' => 'sales',
                    'title' => 'Rapports ventes',
                    'description' => 'Suivi des ventes et des meilleurs articles.',
                    'href' => '/api/reports/sales',
                ]
                : null,
            $this->canAccessStockReports($user)
                ? [
                    'key' => 'stock',
                    'title' => 'Rapports stock',
                    'description' => 'Alertes de stock, peremptions et mouvements.',
                    'href' => '/api/reports/stock',
                ]
                : null,
            $this->canAccessCashReports($user)
                ? [
                    'key' => 'cash',
                    'title' => 'Rapports caisse',
                    'description' => 'Suivi des ouvertures, clotures et ecarts.',
                    'href' => '/api/reports/cash',
                ]
                : null,
        ]));

        abort_if($reports === [], 403, 'User does not have the right permissions.');

        return response()->json([
            'available_reports' => $reports,
        ]);
    }

    public function sales(ReportFilterRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->canAccessSalesReports($user), 403, 'User does not have the right permissions.');

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $salesQuery = Sale::query()->paid()->betweenDates($startDate . ' 00:00:00', $endDate . ' 23:59:59');

        if (! $user->hasRole('admin')) {
            $salesQuery->byUser($user->id);
        }

        $salesByDay = (clone $salesQuery)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $salesByUser = (clone $salesQuery)
            ->with('user:id,name')
            ->selectRaw('user_id, COUNT(*) as count, SUM(total_amount) as total')
            ->groupBy('user_id')
            ->get();

        $topArticles = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('articles', 'sale_items.article_id', '=', 'articles.id')
            ->where('sales.organization_id', $user->organization_id)
            ->where('sales.payment_status', 'PAID')
            ->when(! $user->hasRole('admin'), function ($query) use ($user) {
                $query->where('sales.user_id', $user->id);
            })
            ->whereBetween('sales.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->selectRaw('articles.id, articles.name, SUM(sale_items.quantity) as total_quantity, SUM(sale_items.subtotal) as total_revenue')
            ->groupBy('articles.id', 'articles.name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        return response()->json([
            'sales_by_day' => $salesByDay,
            'sales_by_user' => $salesByUser,
            'top_articles' => $topArticles,
            'totals' => [
                'count' => (clone $salesQuery)->count(),
                'amount' => (float) (clone $salesQuery)->sum('total_amount'),
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function stock(ReportFilterRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->canAccessStockReports($user), 403, 'User does not have the right permissions.');

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $lowStockArticles = Article::lowStock()->with('category')->get();
        $expiringSoon = Article::expiringSoon()->with('category')->get();
        $expired = Article::expired()->with('category')->get();

        $stockValue = (float) (Article::query()
            ->selectRaw('SUM(current_stock * price) as total_value')
            ->first()
            ->total_value ?? 0);

        $movementsSummary = StockMovement::query()
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->selectRaw('movement_type, COUNT(*) as count, SUM(quantity) as total_quantity')
            ->groupBy('movement_type')
            ->get();

        $recentMovements = StockMovement::query()
            ->with(['article:id,name', 'user:id,name'])
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->latest()
            ->take(10)
            ->get();

        return response()->json([
            'low_stock_articles' => $lowStockArticles,
            'expiring_soon' => $expiringSoon,
            'expired' => $expired,
            'stock_value' => $stockValue,
            'movements_summary' => $movementsSummary,
            'recent_movements' => $recentMovements,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function cash(ReportFilterRequest $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->canAccessCashReports($user), 403, 'User does not have the right permissions.');

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $dailySummary = CashRegister::query()
            ->whereBetween('date', [$startDate, $endDate])
            ->with('user:id,name')
            ->orderBy('date')
            ->get();

        return response()->json([
            'daily_summary' => $dailySummary,
            'totals' => [
                'opening' => (float) $dailySummary->sum('opening_balance'),
                'inputs' => (float) $dailySummary->sum('total_input'),
                'outputs' => (float) $dailySummary->sum('total_output'),
                'closing' => (float) $dailySummary->sum('actual_balance'),
                'difference' => (float) $dailySummary->sum('difference'),
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    private function resolveDateRange(ReportFilterRequest $request): array
    {
        return [
            $request->validated('start_date') ?? now()->startOfMonth()->toDateString(),
            $request->validated('end_date') ?? now()->toDateString(),
        ];
    }

    private function canAccessSalesReports($user): bool
    {
        return $user->hasRole('admin') || $user->can('sales.reports');
    }

    private function canAccessStockReports($user): bool
    {
        return $user->hasRole('admin') || $user->can('stock.reports');
    }

    private function canAccessCashReports($user): bool
    {
        return $user->hasRole('admin') || $user->can('cash.reports');
    }
}
