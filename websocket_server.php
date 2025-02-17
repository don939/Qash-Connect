<?php
require 'vendor/autoload.php';
require_once 'monitor_websocket.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use React\EventLoop\Factory;

class MatchingWebSocket implements MessageComponentInterface {
    protected $clients;
    protected $userConnections;
    private $logger;
    private $monitor;

    public function __construct(Logger $logger, WebSocketMonitor $monitor) {
        $this->clients = new \SplObjectStorage;
        $this->userConnections = [];
        $this->logger = $logger;
        $this->monitor = $monitor;
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $this->logger->log("New connection! ({$conn->resourceId})", 'INFO');
        $this->monitor->recordConnection();
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $this->monitor->recordMessage('received');
        $data = json_decode($msg, true);
        
        if ($data['type'] === 'register') {
            $this->userConnections[$data['userId']] = $from;
        }
        
        if ($data['type'] === 'match_update') {
            $this->notifyUser($data['userId'], $data['message']);
            $this->monitor->recordMessage('sent');
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        $this->removeConnection($conn);
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        $this->logger->log("Error: {$e->getMessage()}", 'ERROR');
        $conn->close();
    }

    private function notifyUser($userId, $message) {
        if (isset($this->userConnections[$userId])) {
            $this->userConnections[$userId]->send(json_encode($message));
        }
    }

    private function removeConnection($conn) {
        foreach ($this->userConnections as $userId => $connection) {
            if ($connection === $conn) {
                unset($this->userConnections[$userId]);
                break;
            }
        }
    }
}

// Create WebSocket server
$loop = Factory::create();
$webSocket = new MatchingWebSocket(new Logger(), new WebSocketMonitor(new Logger()));
$server = IoServer::factory(
    new HttpServer(
        new WsServer($webSocket)
    ),
    8080,
    '0.0.0.0',
    $loop
);

$server->run(); 