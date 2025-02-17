<?php
class PasswordPolicy {
    public static function validatePassword($password) {
        $errors = [];
        
        // Minimum length of 12 characters
        if (strlen($password) < 12) {
            $errors[] = "Password must be at least 12 characters long";
        }
        
        // Must contain uppercase
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = "Password must contain at least one uppercase letter";
        }
        
        // Must contain lowercase
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = "Password must contain at least one lowercase letter";
        }
        
        // Must contain numbers
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = "Password must contain at least one number";
        }
        
        // Must contain special characters
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = "Password must contain at least one special character";
        }
        
        return empty($errors) ? true : $errors;
    }

    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => 65536,
            'time_cost' => 4,
            'threads' => 3
        ]);
    }
} 