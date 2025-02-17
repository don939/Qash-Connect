<?php
class DatabaseBackup {
    private $pdo;
    private $backupDir;
    private $logger;

    public function __construct($pdo, $backupDir = 'backups', Logger $logger) {
        $this->pdo = $pdo;
        $this->backupDir = $backupDir;
        $this->logger = $logger;

        if (!file_exists($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
    }

    public function createBackup() {
        $filename = $this->backupDir . '/backup_' . date('Y-m-d_H-i-s') . '.sql';
        $command = sprintf(
            'mysqldump -h%s -u%s -p%s %s > %s',
            escapeshellarg($this->pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS)),
            escapeshellarg($this->username),
            escapeshellarg($this->password),
            escapeshellarg($this->dbname),
            escapeshellarg($filename)
        );

        exec($command, $output, $returnVar);

        if ($returnVar === 0) {
            $this->logger->log('Database backup created successfully', 'INFO');
            $this->cleanOldBackups();
        } else {
            $this->logger->log('Database backup failed', 'ERROR');
        }
    }

    private function cleanOldBackups() {
        // Keep only last 7 days of backups
        $files = glob($this->backupDir . '/backup_*.sql');
        $now = time();
        
        foreach ($files as $file) {
            if ($now - filemtime($file) > 7 * 24 * 3600) {
                unlink($file);
            }
        }
    }
}
?> 