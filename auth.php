<?php
session_start();

class Auth {
    private $pdo;
    private $attempts = [];
    private $maxAttempts = 5;
    private $lockoutTime = 900; // 15 minutes

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function authenticate($username, $password) {
        if ($this->isIpBlocked()) {
            throw new Exception('Too many login attempts. Please try again later.');
        }

        $stmt = $this->pdo->prepare("SELECT id, password_hash FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            $_SESSION['admin_id'] = $user['id'];
            $_SESSION['last_activity'] = time();
            $this->updateLastLogin($user['id']);
            $this->clearLoginAttempts();
            return true;
        }

        $this->recordFailedAttempt();
        return false;
    }

    private function isIpBlocked() {
        $ip = $_SERVER['REMOTE_ADDR'];
        if (!isset($this->attempts[$ip])) {
            return false;
        }

        $attempts = $this->attempts[$ip];
        if (count($attempts) >= $this->maxAttempts) {
            $oldestAttempt = min($attempts);
            if (time() - $oldestAttempt < $this->lockoutTime) {
                return true;
            }
            $this->clearLoginAttempts();
        }
        return false;
    }

    private function recordFailedAttempt() {
        $ip = $_SERVER['REMOTE_ADDR'];
        if (!isset($this->attempts[$ip])) {
            $this->attempts[$ip] = [];
        }
        $this->attempts[$ip][] = time();
    }

    private function clearLoginAttempts() {
        $ip = $_SERVER['REMOTE_ADDR'];
        unset($this->attempts[$ip]);
    }

    private function updateLastLogin($userId) {
        $stmt = $this->pdo->prepare("UPDATE admin_users SET last_login = NOW() WHERE id = ?");
        $stmt->execute([$userId]);
    }

    public static function checkAuth() {
        if (!isset($_SESSION['admin_id']) || 
            !isset($_SESSION['last_activity']) || 
            (time() - $_SESSION['last_activity'] > 1800)) { // 30 minutes timeout
            session_destroy();
            header('Location: login.php');
            exit;
        }
        $_SESSION['last_activity'] = time();
    }
}
?> 