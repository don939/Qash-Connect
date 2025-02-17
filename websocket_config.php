<?php
return [
    'websocket' => [
        'host' => '0.0.0.0',
        'port' => 8080,
        'allowed_origins' => [
            'localhost',
            'qashconnect.com'
        ],
        'max_connections' => 1000,
        'ping_interval' => 30
    ],
    'ssl' => [
        'enabled' => true,
        'certificate' => '/etc/letsencrypt/live/qashconnect.com/fullchain.pem',
        'private_key' => '/etc/letsencrypt/live/qashconnect.com/privkey.pem'
    ],
    'monitoring' => [
        'enabled' => true,
        'log_path' => '/var/log/qashconnect/websocket.log',
        'metrics_port' => 9100
    ]
]; 