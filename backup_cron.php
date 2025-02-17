<?php
require_once 'db_connect.php';
require_once 'logger.php';
require_once 'backup.php';

$logger = new Logger();
$backup = new DatabaseBackup($pdo, 'backups', $logger);

try {
    $backup->createBackup();
} catch (Exception $e) {
    $logger->log('Backup cron failed: ' . $e->getMessage(), 'ERROR');
} 