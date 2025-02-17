<?php
require_once 'logger.php';

class DependencyChecker {
    private $logger;
    private $composerLock = 'composer.lock';
    private $packageJson = 'package.json';

    public function __construct(Logger $logger) {
        $this->logger = $logger;
    }

    public function checkDependencies() {
        $this->checkComposerDependencies();
        $this->checkNpmDependencies();
        $this->checkPHPVersion();
    }

    private function checkComposerDependencies() {
        if (file_exists($this->composerLock)) {
            exec('composer outdated --direct', $output);
            foreach ($output as $line) {
                $this->logger->log('Composer dependency check: ' . $line, 'INFO');
            }
        }
    }

    private function checkNpmDependencies() {
        if (file_exists($this->packageJson)) {
            exec('npm audit', $output);
            foreach ($output as $line) {
                $this->logger->log('NPM security audit: ' . $line, 'INFO');
            }
        }
    }

    private function checkPHPVersion() {
        if (version_compare(PHP_VERSION, '7.4.0', '<')) {
            $this->logger->log('PHP version is outdated. Current: ' . PHP_VERSION, 'WARNING');
        }
    }
} 