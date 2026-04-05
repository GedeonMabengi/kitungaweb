<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationCheckoutRequest;
use App\Models\OrganizationSubscription;
use App\Models\SubscriptionPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Inertia\Inertia;

class OrganizationSubscriptionController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'verified', 'role:admin'])->only('store');
    }

    public function store(StoreOrganizationCheckoutRequest $request): Response|RedirectResponse
    {
        $organization = $request->user()->organization;
        $plan = config('subscriptions.plans.' . $request->validated('plan_code'));
        $billingCycle = $request->validated('billing_cycle');
        $amount = $billingCycle === 'yearly'
            ? $plan['yearly_amount']
            : $plan['monthly_amount'];

        $payload = DB::transaction(function () use (
            $amount,
            $billingCycle,
            $organization,
            $plan,
            $request,
        ): array {
            $subscription = OrganizationSubscription::create([
                'organization_id' => $organization->id,
                'plan_code' => $request->validated('plan_code'),
                'plan_name' => $plan['name'],
                'billing_cycle' => $billingCycle,
                'amount' => $amount,
                'currency' => $plan['currency'],
                'seats_limit' => $plan['seats_limit'],
                'features' => $plan['features'],
                'provider' => 'cinetpay',
                'status' => 'pending',
            ]);

            $payment = SubscriptionPayment::create([
                'organization_id' => $organization->id,
                'organization_subscription_id' => $subscription->id,
                'transaction_id' => 'ORGSUB-' . now()->format('YmdHis') . '-' . Str::upper(Str::random(8)),
                'amount' => $amount,
                'currency' => $plan['currency'],
                'customer_name' => $request->user()->name,
                'customer_email' => $request->user()->email,
                'status' => 'pending',
            ]);

            $response = Http::timeout(30)->post(
                rtrim((string) config('services.cinetpay.base_url'), '/') . '/payment',
                [
                    'apikey' => config('services.cinetpay.api_key'),
                    'site_id' => config('services.cinetpay.site_id'),
                    'transaction_id' => $payment->transaction_id,
                    'amount' => (int) $payment->amount,
                    'currency' => $payment->currency,
                    'description' => "Abonnement {$plan['name']} pour {$organization->name}",
                    'notify_url' => route('organization.subscription.notify'),
                    'return_url' => route('organization.subscription.callback'),
                    'customer_name' => $request->user()->name,
                    'customer_email' => $request->user()->email,
                    'channels' => 'ALL',
                    'metadata' => json_encode([
                        'organization_id' => $organization->id,
                        'subscription_id' => $subscription->id,
                        'payment_id' => $payment->id,
                    ]),
                ],
            )->throw()->json();

            $payment->update([
                'provider_transaction_id' => data_get($response, 'data.payment_token')
                    ?? data_get($response, 'data.transaction_id')
                    ?? $payment->transaction_id,
                'provider_payment_url' => data_get($response, 'data.payment_url')
                    ?? data_get($response, 'data.payment_url_mobile')
                    ?? data_get($response, 'payment_url'),
                'raw_payload' => $response,
            ]);

            return [
                'payment_url' => $payment->provider_payment_url,
            ];
        });

        if (! $payload['payment_url']) {
            return back()->with('error', 'CinetPay n’a pas retourne d’URL de paiement.');
        }

        return Inertia::location($payload['payment_url']);
    }

    public function callback(Request $request): RedirectResponse
    {
        $this->verifyAndSyncPayment($request);

        return redirect()
            ->route('organization.show')
            ->with('success', "Le statut de l'abonnement a ete mis a jour.");
    }

    public function notify(Request $request)
    {
        $this->verifyAndSyncPayment($request);

        return response()->json(['status' => 'ok']);
    }

    private function verifyAndSyncPayment(Request $request): void
    {
        $transactionId = $request->string('transaction_id')->toString()
            ?: $request->string('cpm_trans_id')->toString();

        if (! $transactionId) {
            return;
        }

        $payment = SubscriptionPayment::query()
            ->where('transaction_id', $transactionId)
            ->first();

        if (! $payment) {
            return;
        }

        $verification = Http::timeout(30)->post(
            rtrim((string) config('services.cinetpay.base_url'), '/') . '/payment/check',
            [
                'apikey' => config('services.cinetpay.api_key'),
                'site_id' => config('services.cinetpay.site_id'),
                'transaction_id' => $transactionId,
            ],
        )->throw()->json();

        $status = strtoupper((string) (data_get($verification, 'data.status')
            ?? data_get($verification, 'data.payment_status')
            ?? data_get($verification, 'status')
            ?? ''));

        $payment->update([
            'verified_payload' => $verification,
        ]);

        if (! in_array($status, ['ACCEPTED', 'SUCCESS', 'PAID'], true)) {
            $payment->update(['status' => 'failed']);
            $payment->subscription?->update(['status' => 'pending']);

            return;
        }

        DB::transaction(function () use ($payment): void {
            OrganizationSubscription::query()
                ->where('organization_id', $payment->organization_id)
                ->whereIn('status', ['trialing', 'active'])
                ->where('id', '!=', $payment->organization_subscription_id)
                ->update([
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                ]);

            $payment->update([
                'status' => 'paid',
                'paid_at' => now(),
            ]);

            $payment->subscription?->update([
                'provider_reference' => $payment->provider_transaction_id ?: $payment->transaction_id,
                'status' => 'active',
                'starts_at' => now(),
                'ends_at' => $payment->subscription->billing_cycle === 'yearly'
                    ? now()->addYear()
                    : now()->addMonth(),
                'trial_ends_at' => null,
            ]);
        });
    }
}
