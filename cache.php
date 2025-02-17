<?php
class Cache {
    private $cache;
    private $ttl;

    public function __construct($ttl = 300) { // 5 minutes default TTL
        $this->ttl = $ttl;
        $this->cache = new APCu();
    }

    public function get($key) {
        return $this->cache->get($key);
    }

    public function set($key, $value) {
        return $this->cache->set($key, $value, $this->ttl);
    }

    public function delete($key) {
        return $this->cache->delete($key);
    }

    public function clear() {
        return $this->cache->clear();
    }
}
?> 