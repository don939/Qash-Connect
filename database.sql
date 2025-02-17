CREATE DATABASE qash_connect;
USE qash_connect;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requester_id INT,
    provider_id INT,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(10,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- User Activity Log
CREATE TABLE user_activity (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    activity_type ENUM('login', 'request', 'provide', 'complete'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Geographic Data
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(100),
    total_users INT DEFAULT 0,
    total_transactions INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin Users
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    last_login TIMESTAMP NULL
);

-- Add indexes for better performance
ALTER TABLE users ADD INDEX idx_created_at (created_at);
ALTER TABLE transactions ADD INDEX idx_status (status);
ALTER TABLE transactions ADD INDEX idx_created_at (created_at);
ALTER TABLE user_activity ADD INDEX idx_activity_date (created_at);
ALTER TABLE user_activity ADD INDEX idx_activity_type (activity_type);
ALTER TABLE locations ADD INDEX idx_city (city);

-- Add composite indexes for common queries
ALTER TABLE transactions ADD INDEX idx_status_date (status, created_at);
ALTER TABLE user_activity ADD INDEX idx_user_type_date (user_id, activity_type, created_at);

-- Add privacy settings table
CREATE TABLE user_privacy_settings (
    user_id INT PRIMARY KEY,
    share_location BOOLEAN DEFAULT true,
    share_contact BOOLEAN DEFAULT false,
    share_history BOOLEAN DEFAULT true,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add privacy-related columns to users table
ALTER TABLE users
ADD COLUMN last_location_update TIMESTAMP,
ADD COLUMN location_accuracy ENUM('precise', 'approximate', 'city') DEFAULT 'precise'; 