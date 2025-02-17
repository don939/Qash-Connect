<?php
require_once 'db_connect.php';
require_once 'logger.php';
require_once 'cache.php';
require_once 'rate_limiter.php';

class AIMatchingService {
    private $pdo;
    private $logger;
    private $cache;
    private $rateLimiter;
    private $maxDistance = 10; // Maximum distance in kilometers
    private $weights = [
        'distance' => 0.6,
        'rating' => 0.2,
        'transaction_history' => 0.2
    ];

    public function __construct($pdo, Logger $logger) {
        $this->pdo = $pdo;
        $this->logger = $logger;
        $this->cache = new Cache();
        $this->rateLimiter = new RateLimiter($pdo);
    }

    public function findOptimalMatches($userId, $amount, $location) {
        try {
            // Check rate limit
            $this->rateLimiter->checkLimit($userId, 'matching');

            // Check cache first
            $cacheKey = "matches_{$userId}_{$amount}_{$location['lat']}_{$location['lng']}";
            $cachedResult = $this->cache->get($cacheKey);
            if ($cachedResult !== false) {
                return $cachedResult;
            }

            // Get user's current location
            $userLat = $location['lat'];
            $userLng = $location['lng'];

            // Find potential matches within radius
            $matches = $this->getPotentialMatches($userLat, $userLng, $amount);
            
            // Score and rank matches
            $rankedMatches = $this->rankMatches($matches, $userLat, $userLng);
            
            // Get optimal route for top matches
            $topMatches = array_slice($rankedMatches, 0, 3);
            $routes = $this->calculateRoutes($userLat, $userLng, $topMatches);

            $result = [
                'matches' => $topMatches,
                'routes' => $routes
            ];

            // Cache the result
            $this->cache->set($cacheKey, $result, 300); // Cache for 5 minutes

            // Notify via WebSocket
            $this->notifyMatchUpdate($userId, $result);

            return $result;
        } catch (Exception $e) {
            $this->logger->log('AI Matching error: ' . $e->getMessage(), 'ERROR');
            return null;
        }
    }

    private function getPotentialMatches($lat, $lng, $amount) {
        $sql = "
            SELECT 
                u.id, u.name, u.rating,
                t.location_lat, t.location_lng, t.amount,
                (
                    6371 * acos(
                        cos(radians(?)) * cos(radians(t.location_lat)) 
                        * cos(radians(t.location_lng) - radians(?)) 
                        + sin(radians(?)) * sin(radians(t.location_lat))
                    )
                ) AS distance
            FROM users u
            JOIN transactions t ON u.id = t.provider_id
            WHERE t.status = 'pending'
            AND t.amount >= ?
            HAVING distance <= ?
            ORDER BY distance
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$lat, $lng, $lat, $amount, $this->maxDistance]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function rankMatches($matches, $userLat, $userLng) {
        foreach ($matches as &$match) {
            // Calculate distance score (inverse - closer is better)
            $distanceScore = 1 - ($match['distance'] / $this->maxDistance);
            
            // Calculate rating score
            $ratingScore = $match['rating'] / 5.0;
            
            // Get transaction history score
            $historyScore = $this->getTransactionHistoryScore($match['id']);
            
            // Calculate weighted score
            $match['score'] = 
                ($this->weights['distance'] * $distanceScore) +
                ($this->weights['rating'] * $ratingScore) +
                ($this->weights['transaction_history'] * $historyScore);
        }

        // Sort by score
        usort($matches, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });

        return $matches;
    }

    private function getTransactionHistoryScore($userId) {
        $sql = "
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_transactions
            FROM transactions
            WHERE provider_id = ? OR requester_id = ?
        ";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $userId]);
        $history = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($history['total_transactions'] == 0) return 0;
        return $history['successful_transactions'] / $history['total_transactions'];
    }

    private function calculateRoutes($userLat, $userLng, $matches) {
        $routes = [];
        foreach ($matches as $match) {
            // Get route using Google Maps Directions API
            $route = $this->getGoogleMapsRoute(
                [$userLat, $userLng],
                [$match['location_lat'], $match['location_lng']]
            );
            
            if ($route) {
                $routes[$match['id']] = $route;
            }
        }
        return $routes;
    }

    private function getGoogleMapsRoute($origin, $destination) {
        $apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
        $url = sprintf(
            'https://maps.googleapis.com/maps/api/directions/json?origin=%f,%f&destination=%f,%f&mode=walking&key=%s',
            $origin[0], $origin[1], $destination[0], $destination[1], $apiKey
        );

        $response = file_get_contents($url);
        $data = json_decode($response, true);

        if ($data['status'] === 'OK') {
            return [
                'distance' => $data['routes'][0]['legs'][0]['distance']['text'],
                'duration' => $data['routes'][0]['legs'][0]['duration']['text'],
                'steps' => $data['routes'][0]['legs'][0]['steps']
            ];
        }

        return null;
    }

    private function notifyMatchUpdate($userId, $matches) {
        $ch = curl_init('ws://localhost:8080');
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'type' => 'match_update',
            'userId' => $userId,
            'message' => $matches
        ]));
        curl_exec($ch);
        curl_close($ch);
    }
}
?> 