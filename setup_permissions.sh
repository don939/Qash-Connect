#!/bin/bash

# Set web root permissions
chmod 755 /var/www/html
chown -R www-data:www-data /var/www/html

# Set specific directory permissions
chmod 750 /var/www/html/logs
chmod 750 /var/www/html/backups
chmod 750 /var/www/html/config

# Set file permissions
find /var/www/html -type f -exec chmod 644 {} \;
find /var/www/html -type d -exec chmod 755 {} \;

# Make specific files executable
chmod 700 /var/www/html/backup_cron.php

# Protect sensitive files
chmod 600 /var/www/html/config/db_connect.php
chmod 600 /var/www/html/logs/*.log
chmod 600 /var/www/html/backups/*.sql 