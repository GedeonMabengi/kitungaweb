<?php

return [
    'trial_days' => 14,

    'plans' => [
        'starter' => [
            'name' => 'Starter',
            'monthly_amount' => 29,
            'yearly_amount' => 290,
            'currency' => 'USD',
            'seats_limit' => 5,
            'features' => [
                '1 point de vente',
                'Gestion stock et caisse',
                '5 collaborateurs',
            ],
        ],
        'business' => [
            'name' => 'Business',
            'monthly_amount' => 79,
            'yearly_amount' => 790,
            'currency' => 'USD',
            'seats_limit' => 20,
            'features' => [
                'Multi caisses',
                'Rapports avances',
                '20 collaborateurs',
            ],
        ],
        'enterprise' => [
            'name' => 'Enterprise',
            'monthly_amount' => 149,
            'yearly_amount' => 1490,
            'currency' => 'USD',
            'seats_limit' => null,
            'features' => [
                'Collaborateurs illimites',
                'Support prioritaire',
                'Configuration sur mesure',
            ],
        ],
    ],
];
