<?php
class Logger {
    private $logFile;
    private $logLevel;

    public function __construct($logFile = 'logs/app.log', $logLevel = 'INFO') {
        $this->logFile = $logFile;
        $this->logLevel = $logLevel;
        
        // Create logs directory if it doesn't exist
        $logDir = dirname($logFile);
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    public function log($message, $level = 'INFO', $context = []) {
        $date = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? json_encode($context) : '';
        $logMessage = "[$date] [$level] $message $contextStr\n";
        
        error_log($logMessage, 3, $this->logFile);
        
        if ($level === 'ERROR') {
            // Send notification for critical errors
            $this->notifyAdmin($message);
        }
    }

    private function notifyAdmin($message) {
        // Implement admin notification (email, SMS, etc.)
    }
}
?> 