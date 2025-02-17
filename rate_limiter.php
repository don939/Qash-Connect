<?php
class RateLimiter {
    private $pdo;
    private $limits = [
        'matching' => ['requests' => 10, 'window' => 60], // 10 requests per minute
        'routing' => ['requests' => 100, 'window' => 3600] // 100 requests per hour
    ];

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->initializeTable();
    }

    private function initializeTable() {
        $sql = "
            CREATE TABLE IF NOT EXISTS rate_limits (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                action_type VARCHAR(50),
                request_count INT DEFAULT 1,
                window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ";
        $this->pdo->exec($sql);
    }

    public function checkLimit($userId, $actionType) {
        $sql = "SELECT request_count, window_start FROM rate_limits 
                WHERE user_id = ? AND action_type = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId, $actionType]);
        $record = $stmt->fetch(PDO::FETCH_ASSOC);

        $limit = $this->limits[$actionType];
        $now = time();

        if (!$record) {
            $this->insertNewRecord($userId, $actionType);
            return true;
        }

        $windowStart = strtotime($record['window_start']);
        if (($now - $windowStart) > $limit['window']) {
            $this->resetWindow($userId, $actionType);
            return true;
        }

        if ($record['request_count'] >= $limit['requests']) {
            throw new Exception("Rate limit exceeded for $actionType");
        }

        $this->incrementCount($userId, $actionType);
        return true;
    }

    private function insertNewRecord($userId, $actionType) {
        $sql = "INSERT INTO rate_limits (user_id, action_type) VALUES (?, ?)";
        $this->pdo->prepare($sql)->execute([$userId, $actionType]);
    }

    private function resetWindow($userId, $actionType) {
        $sql = "UPDATE rate_limits SET request_count = 1, window_start = CURRENT_TIMESTAMP 
                WHERE user_id = ? AND action_type = ?";
        $this->pdo->prepare($sql)->execute([$userId, $actionType]);
    }

    private function incrementCount($userId, $actionType) {
        $sql = "UPDATE rate_limits SET request_count = request_count + 1 
                WHERE user_id = ? AND action_type = ?";
        $this->pdo->prepare($sql)->execute([$userId, $actionType]);
    }
}
?> 