-- Users table for authentication system
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE
);
