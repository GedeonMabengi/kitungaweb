<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashInput;
use App\Models\CashOutput;
use App\Models\CashRegister;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashRegisterController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $registers = CashRegister::query()
            ->with('user:id,name')
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
            ->paginate($request->integer('per_page', 20));

        return response()->json($registers);
    }

    public function current(Request $request): JsonResponse
    {
        $register = $request->user()->getOpenCashRegister();

        if (! $register) {
            return response()->json([
                'has_open_register' => false,
                'register' => null,
            ]);
        }

        return response()->json([
            'has_open_register' => true,
            'register' => $register->load(['inputs.sale.user', 'inputs.sale.items.article', 'outputs.user', 'user']),
            'stats' => [
                'opening_balance' => (float) $register->opening_balance,
                'total_input' => (float) $register->total_input,
                'total_output' => (float) $register->total_output,
                'current_balance' => (float) $register->current_balance,
            ],
        ]);
    }

    public function open(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->getOpenCashRegister()) {
            return response()->json([
                'message' => 'Une caisse est deja ouverte pour votre organisation aujourd hui.',
            ], 422);
        }

        $validated = $request->validate([
            'opening_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $register = CashRegister::create([
            'organization_id' => $user->organization_id,
            'user_id' => $user->id,
            'date' => today(),
            'opening_balance' => $validated['opening_balance'],
            'expected_balance' => $validated['opening_balance'],
            'status' => CashRegister::STATUS_OPEN,
            'opened_at' => now(),
            'opening_notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Caisse ouverte avec succes.',
            'register' => $register,
        ], 201);
    }

    public function close(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $this->ensureSameOrganization($cashRegister, $request);

        if (! $cashRegister->is_open) {
            return response()->json([
                'message' => 'Cette caisse est deja fermee.',
            ], 422);
        }

        $validated = $request->validate([
            'actual_balance' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $cashRegister->close((float) $validated['actual_balance'], $validated['notes'] ?? null);

        return response()->json([
            'message' => 'Caisse cloturee avec succes.',
            'register' => $cashRegister->fresh(),
        ]);
    }

    public function show(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $this->ensureSameOrganization($cashRegister, $request);

        return response()->json([
            'register' => $cashRegister->load(['user', 'inputs.sale.user', 'inputs.sale.items.article', 'outputs.user']),
        ]);
    }

    public function addInput(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $this->ensureSameOrganization($cashRegister, $request);

        if (! $cashRegister->is_open) {
            return response()->json([
                'message' => 'Cette caisse est fermee.',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'source' => 'required|in:SALE,DEPOSIT,REFUND,OTHER',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $input = CashInput::create([
            'cash_register_id' => $cashRegister->id,
            'user_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'source' => $validated['source'],
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Entree de caisse enregistree.',
            'input' => $input,
            'register' => $cashRegister->fresh(),
        ], 201);
    }

    public function addOutput(Request $request, CashRegister $cashRegister): JsonResponse
    {
        $this->ensureSameOrganization($cashRegister, $request);

        if (! $cashRegister->is_open) {
            return response()->json([
                'message' => 'Cette caisse est fermee.',
            ], 422);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'beneficiary' => 'nullable|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ((float) $validated['amount'] > (float) $cashRegister->current_balance) {
            return response()->json([
                'message' => 'Montant superieur au solde disponible.',
            ], 422);
        }

        $output = CashOutput::create([
            'cash_register_id' => $cashRegister->id,
            'user_id' => $request->user()->id,
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'beneficiary' => $validated['beneficiary'] ?? null,
            'reference' => $validated['reference'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Sortie de caisse enregistree.',
            'output' => $output,
            'register' => $cashRegister->fresh(),
        ], 201);
    }

    private function ensureSameOrganization(CashRegister $cashRegister, Request $request): void
    {
        abort_if((int) $cashRegister->organization_id !== (int) $request->user()->organization_id, 403);
    }
}
