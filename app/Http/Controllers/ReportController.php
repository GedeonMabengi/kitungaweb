<?php
// app/Http/Controllers/ReportController.php

namespace App\Http\Controllers;

use App\Http\Requests\ReportFilterRequest;
use App\Models\Article;
use App\Models\CashRegister;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $reports = array_values(array_filter([
            $this->canAccessSalesReports($user)
                ? [
                    'key' => 'sales',
                    'title' => 'Ventes',
                    'description' => 'Volumes, chiffres journaliers et performances commerciales adaptes au profil connecte.',
                    'href' => route('reports.sales'),
                ]
                : null,
            $this->canAccessStockReports($user)
                ? [
                    'key' => 'stock',
                    'title' => 'Stock',
                    'description' => 'Stocks faibles, peremptions, mouvements et valeur du stock de l organisation.',
                    'href' => route('reports.stock'),
                ]
                : null,
            $this->canAccessCashReports($user)
                ? [
                    'key' => 'cash',
                    'title' => 'Caisse',
                    'description' => 'Ouvertures, flux, ecarts et historique de caisse de la periode choisie.',
                    'href' => route('reports.cash'),
                ]
                : null,
        ]));

        abort_if($reports === [], 403, 'User does not have the right permissions.');

        return Inertia::render('Reports/Index', [
            'availableReports' => $reports,
        ]);
    }

    public function sales(ReportFilterRequest $request): Response
    {
        $user = $request->user();
        abort_unless($this->canAccessSalesReports($user), 403, 'User does not have the right permissions.');

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $salesQuery = Sale::query()
            ->paid()
            ->betweenDates($startDate . ' 00:00:00', $endDate . ' 23:59:59');

        if (! $user->hasRole('admin')) {
            $salesQuery->where('user_id', $user->id);
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

        $topArticles = SaleItem::query()
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('articles', 'sale_items.article_id', '=', 'articles.id')
            ->where('sales.payment_status', Sale::STATUS_PAID)
            ->whereBetween('sales.created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->when(! $user->hasRole('admin'), fn ($query) => $query->where('sales.user_id', $user->id))
            ->selectRaw('articles.id, articles.name, SUM(sale_items.quantity) as total_quantity, SUM(sale_items.subtotal) as total_revenue')
            ->groupBy('articles.id', 'articles.name')
            ->orderByDesc('total_revenue')
            ->limit(10)
            ->get();

        $recentSales = (clone $salesQuery)
            ->with('user:id,name', 'items.article:id,name')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Reports/Sales', [
            'salesByDay' => $salesByDay,
            'salesByUser' => $salesByUser,
            'topArticles' => $topArticles,
            'recentSales' => $recentSales,
            'totals' => [
                'count' => (clone $salesQuery)->count(),
                'amount' => (clone $salesQuery)->sum('total_amount'),
            ],
            'scopeLabel' => $user->hasRole('admin') ? 'Organisation' : 'Mes ventes',
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function stock(ReportFilterRequest $request): Response
    {
        $user = $request->user();
        abort_unless($this->canAccessStockReports($user), 403, 'User does not have the right permissions.');

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $lowStockArticles = Article::lowStock()
            ->with('category')
            ->orderBy('current_stock')
            ->get();

        $expiringSoon = Article::expiringSoon()
            ->with('category')
            ->orderBy('expiration_date')
            ->get();

        $expired = Article::expired()
            ->with('category')
            ->orderByDesc('expiration_date')
            ->get();

        $stockValue = Article::query()
            ->selectRaw('SUM(current_stock * price) as total_value')
            ->first()
            ?->total_value ?? 0;

        $movementsSummary = StockMovement::query()
            ->betweenDates($startDate . ' 00:00:00', $endDate . ' 23:59:59')
            ->selectRaw('movement_type, COUNT(*) as count, SUM(quantity) as total_quantity')
            ->groupBy('movement_type')
            ->get();

        $recentMovements = StockMovement::with('article:id,name', 'user:id,name')
            ->betweenDates($startDate . ' 00:00:00', $endDate . ' 23:59:59')
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Reports/Stock', [
            'lowStockArticles' => $lowStockArticles,
            'expiringSoon' => $expiringSoon,
            'expired' => $expired,
            'stockValue' => $stockValue,
            'movementsSummary' => $movementsSummary,
            'recentMovements' => $recentMovements,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function cash(ReportFilterRequest $request): Response
    {
        $user = $request->user();
        abort_unless($this->canAccessCashReports($user), 403, 'User does not have the right permissions.');

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $cashRegistersQuery = CashRegister::query()
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate)
            ->with('user:id,name')
            ->orderByDesc('date');

        if (! $user->hasRole('admin')) {
            $cashRegistersQuery->forUser($user->id);
        }

        $dailySummary = (clone $cashRegistersQuery)->get();

        $totals = [
            'opening' => $dailySummary->sum('opening_balance'),
            'inputs' => $dailySummary->sum('total_input'),
            'outputs' => $dailySummary->sum('total_output'),
            'closing' => $dailySummary->sum('actual_balance'),
            'difference' => $dailySummary->sum('difference'),
        ];

        return Inertia::render('Reports/Cash', [
            'dailySummary' => $dailySummary,
            'totals' => $totals,
            'scopeLabel' => $user->hasRole('admin') ? 'Organisation' : 'Ma caisse',
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function resolveDateRange(ReportFilterRequest $request): array
    {
        $validated = $request->validated();

        return [
            $validated['start_date'] ?? now()->startOfMonth()->toDateString(),
            $validated['end_date'] ?? now()->toDateString(),
        ];
    }

    private function canAccessSalesReports(User $user): bool
    {
        return $user->hasRole('admin') || $user->can('sales.reports');
    }

    private function canAccessStockReports(User $user): bool
    {
        return $user->hasRole('admin') || $user->can('stock.reports');
    }

    private function canAccessCashReports(User $user): bool
    {
        return $user->hasRole('admin') || $user->can('cash.reports');
    }
}
