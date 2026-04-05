<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Laravel\Fortify\Fortify;
use Laravel\Fortify\TwoFactorAuthenticatable;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            Fortify::username() => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $provider = Auth::guard('web')->getProvider();
        $user = $provider->retrieveByCredentials($this->only(Fortify::username(), 'password'));

        if (! $user || ! $provider->validateCredentials($user, ['password' => $this->string('password')->toString()])) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                Fortify::username() => trans('auth.failed'),
            ]);
        }

        if (config('hashing.rehash_on_login', true) && method_exists($provider, 'rehashPasswordIfRequired')) {
            $provider->rehashPasswordIfRequired($user, ['password' => $this->string('password')->toString()]);
        }

        if ($this->requiresTwoFactorChallenge($user)) {
            $this->session()->put([
                'login.id' => $user->getKey(),
                'login.remember' => $this->boolean('remember'),
            ]);

            RateLimiter::clear($this->throttleKey());

            return;
        }

        Auth::login($user, $this->boolean('remember'));
        RateLimiter::clear($this->throttleKey());
    }

    /**
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());
        $message = trans('auth.throttle', [
            'seconds' => $seconds,
            'minutes' => ceil($seconds / 60),
        ]);

        if ($this->expectsJson()) {
            throw new HttpResponseException(
                response()->json([
                    'message' => $message,
                    'errors' => [
                        Fortify::username() => [$message],
                    ],
                ], 429)
            );
        }

        abort(429, $message);
    }

    public function throttleKey(): string
    {
        return md5('login'.implode('|', [
            $this->string(Fortify::username())->lower()->toString(),
            $this->ip(),
        ]));
    }

    private function requiresTwoFactorChallenge(Authenticatable $user): bool
    {
        if (! in_array(TwoFactorAuthenticatable::class, class_uses_recursive($user), true)) {
            return false;
        }

        if (empty($user->two_factor_secret)) {
            return false;
        }

        if (Fortify::confirmsTwoFactorAuthentication() && is_null($user->two_factor_confirmed_at)) {
            return false;
        }

        return true;
    }
}
