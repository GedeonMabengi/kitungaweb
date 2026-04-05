<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizationCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasRole('admin');
    }

    public function rules(): array
    {
        return [
            'plan_code' => [
                'required',
                'string',
                Rule::in(array_keys(config('subscriptions.plans', []))),
            ],
            'billing_cycle' => ['required', Rule::in(['monthly', 'yearly'])],
        ];
    }
}
