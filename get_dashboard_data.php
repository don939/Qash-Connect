<?php
require_once 'auth.php';
require_once 'validation.php';
require_once 'logger.php';
require_once 'cache.php';
require_once 'db_connect.php';

// Initialize components
$auth = new Auth($pdo);
$logger = new Logger();
$cache = new Cache();
$validator = new Validator();

// Check authentication
Auth::checkAuth();

header('Content-Type: application/json');

try {
    // Try to get cached data first
    $cacheKey = 'dashboard_data_' . $_SESSION['admin_id'];
    $data = $cache->get($cacheKey);

    if ($data === false) {
        // Get fresh data if not cached
        $data = [
            'stats' => getUserStats(),
            'activity' => getMonthlyActivity(),
            'transactions' => getTransactionDistribution(),
            'volume' => getTransactionVolume(),
            'locations' => getGeographicDistribution()
        ];

        // Cache the data
        $cache->set($cacheKey, $data);
    }

    echo json_encode($data);
    $logger->log('Dashboard data retrieved successfully', 'INFO');

} catch(Exception $e) {
    $logger->log('Dashboard data error: ' . $e->getMessage(), 'ERROR', [
        'admin_id' => $_SESSION['admin_id'],
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}
?> 