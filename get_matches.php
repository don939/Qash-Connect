<?php
require_once 'auth.php';
require_once 'ai_matching_service.php';
require_once 'validation.php';

header('Content-Type: application/json');

$auth = new Auth($pdo);
$validator = new Validator();
$logger = new Logger();
$matchingService = new AIMatchingService($pdo, $logger);

try {
    // Validate input
    $data = json_decode(file_get_contents('php://input'), true);
    $userId = $validator->sanitizeInput($data['userId']);
    $amount = $validator->sanitizeInput($data['amount']);
    $location = [
        'lat' => $validator->sanitizeInput($data['lat']),
        'lng' => $validator->sanitizeInput($data['lng'])
    ];

    // Get matches
    $matches = $matchingService->findOptimalMatches($userId, $amount, $location);

    if ($matches) {
        echo json_encode([
            'success' => true,
            'data' => $matches
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No suitable matches found'
        ]);
    }
} catch (Exception $e) {
    $logger->log('Match finding error: ' . $e->getMessage(), 'ERROR');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while finding matches'
    ]);
}
?> 