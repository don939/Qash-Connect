<?php
class HttpsEnforcer {
    public static function enforce() {
        if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
            header('HTTP/1.1 301 Moved Permanently');
            header('Location: https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
            exit();
        }

        // Add HSTS header
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
} 