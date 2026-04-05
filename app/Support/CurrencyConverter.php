<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class CurrencyConverter
{
    public function convert(float $amount, string $fromCurrency, string $toCurrency): float
    {
        if ($fromCurrency === $toCurrency) {
            return round($amount, 2);
        }

        return round($amount * $this->rate($fromCurrency, $toCurrency), 2);
    }

    public function ratesFrom(string $baseCurrency, array $targetCurrencies): array
    {
        $targets = array_values(array_unique(array_filter($targetCurrencies)));

        if ($targets === []) {
            return [];
        }

        return collect($targets)
            ->mapWithKeys(function (string $currency) use ($baseCurrency): array {
                return [$currency => $this->rate($baseCurrency, $currency)];
            })
            ->all();
    }

    public function rate(string $fromCurrency, string $toCurrency): float
    {
        if ($fromCurrency === $toCurrency) {
            return 1.0;
        }

        return (float) Cache::remember(
            sprintf('currency-rate:%s:%s', $fromCurrency, $toCurrency),
            now()->addHours(12),
            function () use ($fromCurrency, $toCurrency): float {
                $response = Http::baseUrl(
                    rtrim((string) config('services.frankfurter.url', 'https://api.frankfurter.dev'), '/'),
                )
                    ->acceptJson()
                    ->timeout(10)
                    ->get(sprintf('/v2/rate/%s/%s', $fromCurrency, $toCurrency))
                    ->throw()
                    ->json();

                return (float) data_get($response, 'rate', 1);
            },
        );
    }
}
