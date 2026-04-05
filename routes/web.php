<?php
// routes/web.php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\CashRegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\OrganizationInvitationController;
use App\Http\Controllers\OrganizationSubscriptionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SaleController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Route::has('register'),
    ]);
})->name('home');


/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

// Route::middleware('guest')->group(function () {
//     Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
//     Route::post('login', [AuthenticatedSessionController::class, 'store']);

//     Route::get('register', [AuthenticatedSessionController::class, 'create'])->name('register');
//     Route::post('register', [AuthenticatedSessionController::class, 'store']);
// });

// Route::middleware('auth')->group(function () {
//     Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
// });





Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login.store');
    
    // Routes d'inscription
    Route::get('register', [AuthenticatedSessionController::class, 'createRegister'])->name('register');
    Route::post('register', [AuthenticatedSessionController::class, 'storeRegister'])->name('register.store');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::match(
    ['get', 'post'],
    '/organization/subscription/callback',
    [OrganizationSubscriptionController::class, 'callback'],
)->name('organization.subscription.callback');
Route::post(
    '/organization/subscription/notify',
    [OrganizationSubscriptionController::class, 'notify'],
)->name('organization.subscription.notify');
Route::middleware('guest')->group(function () {
    Route::get(
        '/organization/invitations/{token}',
        [OrganizationInvitationController::class, 'show'],
    )->name('organization.invitations.show');
    Route::post(
        '/organization/invitations/{token}/accept',
        [OrganizationInvitationController::class, 'accept'],
    )->name('organization.invitations.accept');
});




/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/organization', [OrganizationController::class, 'show'])->name('organization.show');
    Route::patch('/organization', [OrganizationController::class, 'update'])->name('organization.update');
    Route::post(
        '/organization/subscription/checkout',
        [OrganizationSubscriptionController::class, 'store'],
    )->name('organization.subscription.checkout');
    Route::post(
        '/organization/invitations',
        [OrganizationInvitationController::class, 'store'],
    )->name('organization.invitations.store');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');
    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');
    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    Route::middleware('subscription.active')->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        /*
        |--------------------------------------------------------------------------
        | Categories Routes
        |--------------------------------------------------------------------------
        */
        Route::resource('categories', CategoryController::class);

        /*
        |--------------------------------------------------------------------------
        | Articles Routes
        |--------------------------------------------------------------------------
        */
        Route::resource('articles', ArticleController::class);
        Route::post('articles/{article}/adjust-stock', [ArticleController::class, 'adjustStock'])
            ->name('articles.adjust-stock');

        /*
        |--------------------------------------------------------------------------
        | Stock Movements Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('stock')->name('stock.')->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
            Route::resource('movements', StockMovementController::class)->only(['index', 'create', 'store', 'show']);
        });

        /*
        |--------------------------------------------------------------------------
        | Sales Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('sales')->name('sales.')->group(function () {
            Route::get('/', [SaleController::class, 'index'])->name('index');
            Route::get('/pos', [SaleController::class, 'pos'])->name('pos');
            Route::post('/', [SaleController::class, 'store'])->name('store');
            Route::get('/{sale}', [SaleController::class, 'show'])->name('show');
            Route::post('/{sale}/cancel', [SaleController::class, 'cancel'])->name('cancel');
        });

        /*
        |--------------------------------------------------------------------------
        | Cash Register Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('cash')->name('cash.')->group(function () {
            Route::get('/', [CashRegisterController::class, 'index'])->name('index');
            Route::get('/dashboard', [CashRegisterController::class, 'dashboard'])->name('dashboard');
            Route::post('/open', [CashRegisterController::class, 'open'])->name('open');
            Route::get('/{cashRegister}', [CashRegisterController::class, 'show'])->name('show');
            Route::post('/{cashRegister}/close', [CashRegisterController::class, 'close'])->name('close');
            Route::post('/{cashRegister}/input', [CashRegisterController::class, 'addInput'])->name('input');
            Route::post('/{cashRegister}/output', [CashRegisterController::class, 'addOutput'])->name('output');
        });

        /*
        |--------------------------------------------------------------------------
        | Reports Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [ReportController::class, 'index'])->name('index');
            Route::get('/sales', [ReportController::class, 'sales'])->name('sales');
            Route::get('/stock', [ReportController::class, 'stock'])->name('stock');
            Route::get('/cash', [ReportController::class, 'cash'])->name('cash');
        });

        /*
        |--------------------------------------------------------------------------
        | Admin Routes
        |--------------------------------------------------------------------------
        */
        Route::prefix('admin')->name('admin.')->middleware('role:admin')->group(function () {
            Route::get('/dashboard', function () {
                return redirect()->route('dashboard');
            })->name('dashboard');

            Route::resource('users', UserController::class);
            Route::post('users/{user}/toggle-active', [UserController::class, 'toggleActive'])
                ->name('users.toggle-active');
        });
    });
});
