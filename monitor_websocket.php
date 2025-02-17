<?php
require_once 'logger.php';

class WebSocketMonitor {
    private $logger;
    private $metricsPort;
    private $metricsPath = '/metrics';
    private $stats = [
        'connections' => 0,
        'messages_sent' => 0,
        'messages_received' => 0,
        'errors' => 0
    ];

    public function __construct(Logger $logger, $config) {
        $this->logger = $logger;
        $this->metricsPort = $config['monitoring']['metrics_port'];
        $this->startMetricsServer();
    }

    public function recordConnection() {
        $this->stats['connections']++;
        $this->logMetric('connections', $this->stats['connections']);
    }

    public function recordMessage($type = 'sent') {
        $key = "messages_{$type}";
        $this->stats[$key]++;
        $this->logMetric($key, $this->stats[$key]);
    }

    public function recordError($error) {
        $this->stats['errors']++;
        $this->logger->log("WebSocket Error: {$error}", 'ERROR');
        $this->logMetric('errors', $this->stats['errors']);
    }

    private function startMetricsServer() {
        $socket = stream_socket_server(
            "tcp://0.0.0.0:{$this->metricsPort}",
            $errno,
            $errstr
        );

        if (!$socket) {
            $this->logger->log("Metrics server error: $errstr", 'ERROR');
            return;
        }

        while ($conn = stream_socket_accept($socket)) {
            $request = fgets($conn);
            if (strpos($request, $this->metricsPath) !== false) {
                $this->sendMetrics($conn);
            }
            fclose($conn);
        }
    }

    private function sendMetrics($conn) {
        $metrics = '';
        foreach ($this->stats as $key => $value) {
            $metrics .= "websocket_{$key} {$value}\n";
        }
        fwrite($conn, "HTTP/1.1 200 OK\r\n");
        fwrite($conn, "Content-Type: text/plain\r\n\r\n");
        fwrite($conn, $metrics);
    }

    private function logMetric($name, $value) {
        $this->logger->log("Metric: {$name} = {$value}", 'INFO');
    }
} 