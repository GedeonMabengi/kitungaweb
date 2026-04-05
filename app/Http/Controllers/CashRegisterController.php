<?php
// app/Http/Controllers/CashRegisterController.php

namespace App\Http\Controllers;

use App\Models\CashInput;
use App\Models\CashOutput;
use App\Models\CashRegister;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashRegisterController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:cash.view')->only(['index', 'show']);
        $this->middleware('permission:cash.open')->only(['open']);
        $this->middleware('permission:cash.close')->only(['close']);
        $this->middleware('permission:cash.input')->only(['addInput']);
        $this->middleware('permission:cash.output')->only(['addOutput']);
    }

    public function index(Request $request): Response
    {
        $user = auth()->user();

        $registers = CashRegister::query()
            ->with('user')
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->start_date && $request->end_date, function ($query) use ($request) {
                $query->whereBetween('date', [$request->start_date, $request->end_date]);
            })
            ->when($request->user_id, function ($query, $userId) {
                $query->forUser($userId);
            })
            ->latest('date')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Cash/Index', [
            'registers' => $registers,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'user_id']),
            'canViewAll' => $user->can('cash.view_all'),
        ]);
    }

    public function dashboard(): Response
    {
        $user = auth()->user();
        $openRegister = $user->getOpenCashRegister();
        $previousClosedRegister = $user->getPreviousClosedCashRegister();

        return Inertia::render('Cash/Dashboard', [
            'openRegister' => $openRegister?->load(['inputs.sale.user', 'outputs.user', 'user']),
            'hasOpenRegister' => $openRegister !== null,
            'todayStats' => $openRegister ? [
                'opening_balance' => $openRegister->opening_balance,
                'total_input' => $openRegister->total_input,
                'total_output' => $openRegister->total_output,
                'current_balance' => $openRegister->current_balance,
            ] : null,
            'previousClosedRegister' => $previousClosedRegister ? [
                'id' => $previousClosedRegister->id,
                'date' => $previousClosedRegister->date?->toDateString(),
                'actual_balance' => $previousClosedRegister->actual_balance,
                'difference' => $previousClosedRegister->difference,
                'closed_at' => $previousClosedRegister->closed_at?->toIso8601String(),
            ] : null,
        ]);
    }

    public function open(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if ($user->getOpenCashRegister()) {
            return back()->with('error', 'Une caisse est deja ouverte pour votre organisation aujourd hui.');
        }

        $validated = $request->validate([
            'opening_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        CashRegister::create([
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'date' => today(),
            'opening_balance' => $validated['opening_balance'],
            'expected_balance' => $validated['opening_balance'],
            'status' => CashRegister::STATUS_OPEN,
            'opened_at' => now(),
            'opening_notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('cash.dashboard')
            ->with('success', 'Caisse ouverte avec succes.');
    }

    public function close(Request $request, CashRegister $cashRegister): RedirectResponse
    {
        $this->ensureSameOrganization($cashRegister);

        if (! $cashRegister->is_open) {
            return back()->with('error', 'Cette caisse est deja fermee.');
        }

        $validated = $request->validate([
            'actual_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $cashRegister->close((float) $validated['actual_balance'], $validated['notes'] ?? null);

        return redirect()->route('cash.index')
            ->with('success', 'Caisse cloturee avec succes.');
    }

    public function show(CashRegister $cashRegister): Response
    {
        $this->ensureSameOrganization($cashRegister);

        return Inertia::render('Cash/Show', [
            'register' => $cashRegister->load(['user', 'inputs.sale.user', 'outputs.user']),
        ]);
    }

    public function addInput(Request $request, CashRegister $cashRegister): RedirectResponse
    {
        $this->ensureSameOrganization($cashRegister);

        if (! $cashRegister->is_open) {
            return back()->with('error', 'Cette caisse est fermee.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'source' => 'required|in:SALE,DEPOSIT,REFUND,OTHER',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        CashInput::create([
            'cash_register_id' => $cashRegister->id,
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'source' => $validated['source'],
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Entree de caisse enregistree.');
    }

    public function addOutput(Request $request, CashRegister $cashRegister): RedirectResponse
    {
        $this->ensureSameOrganization($cashRegister);

        if (! $cashRegister->is_open) {
            return back()->with('error', 'Cette caisse est fermee.');
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'beneficiary' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ((float) $validated['amount'] > (float) $cashRegister->current_balance) {
            return back()->with('error', 'Montant superieur au solde disponible.');
        }

        CashOutput::create([
            'cash_register_id' => $cashRegister->id,
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'beneficiary' => $validated['beneficiary'] ?? null,
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Sortie de caisse enregistree.');
    }

    private function ensureSameOrganization(CashRegister $cashRegister): void
    {
        abort_if((int) $cashRegister->organization_id !== (int) auth()->user()->organization_id, 403);
    }
}

