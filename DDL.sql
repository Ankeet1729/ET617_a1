-- Users table for authentication system
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE
);

-- Events table for tracking clickstream data
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    event_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES users(username),
    CHECK (target_type IN ('video', 'quiz', 'page')),
    CHECK (event_type IN ('option_selected', 'quiz_submitted', 'view', 'scroll', 'start', 'pause', 'end'))
);


