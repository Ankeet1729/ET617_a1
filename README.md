# User Authentication & Clickstream Tracking Web App

## Author

Ankeet Saha

## Overview

This project is a full-stack Node.js web application that provides user authentication (sign up, login, session management) and clickstream event tracking, with an admin dashboard for event analytics. It uses PostgreSQL for data storage, EJS for server-side rendering, and Express.js as the web framework.

The application is designed for educational or starter use cases where you need to manage users, track their interactions (such as quiz answers, video views, etc.), and provide an admin interface for reviewing user activity.

---

## Features

- **User Authentication**
  - Secure sign up with hashed passwords (bcryptjs)
  - Login with username or email
  - Session management using express-session
  - User dashboard after login
  - Logout functionality

- **Clickstream/Event Tracking**
  - Tracks user events (e.g., quiz submissions, video views, etc.)
  - Stores event type, target type, target ID, and optional event data (JSON)
  - Events are associated with the logged-in user

- **Admin Dashboard**
  - Only accessible to the user with username `admin`
  - View all tracked events in a table
  - Filter events by type or username
  - Refresh and clear filters

- **UI**
  - EJS templates for all pages: landing, login, signup, dashboard, admin
  - Responsive, modern design with inline CSS

---

## Directory Structure

```
.
├── DDL.sql                # SQL schema for PostgreSQL database
├── package.json           # Project metadata and dependencies
├── package-lock.json      # Dependency lock file
├── server.js              # Main Express server
├── views/                 # EJS templates for all pages
│   ├── admin.ejs
│   ├── dashboard.ejs
│   ├── index.ejs
│   ├── login.ejs
│   └── signup.ejs
└── README.md              # This file
```

---

## Database Schema

The database schema is defined in `DDL.sql` and consists of two tables:

### `users` Table

| Column        | Type         | Constraints           |
|---------------|--------------|-----------------------|
| username      | VARCHAR(50)  | PRIMARY KEY           |
| password_hash | VARCHAR(255) | NOT NULL              |
| email         | VARCHAR(100) | UNIQUE                |

### `events` Table

| Column      | Type         | Constraints                                      |
|-------------|--------------|--------------------------------------------------|
| id          | SERIAL       | PRIMARY KEY                                      |
| username    | VARCHAR(50)  | NOT NULL, FOREIGN KEY REFERENCES users(username) |
| event_type  | VARCHAR(50)  | NOT NULL, CHECK (see below)                      |
| target_type | VARCHAR(50)  | NOT NULL, CHECK (see below)                      |
| target_id   | INT          | NOT NULL                                         |
| event_data  | JSON         | (optional)                                       |
| created_at  | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP                        |

- `target_type` must be one of: `'video'`, `'quiz'`, `'page'`
- `event_type` must be one of: `'option_selected'`, `'quiz_submitted'`, `'view'`, `'start'`, `'pause'`

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
PORT=3000
DB_USER=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name
SESSION_SECRET=your_session_secret
```

- `PORT`: Port for the Express server (default: 3000)
- `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`: PostgreSQL connection details
- `SESSION_SECRET`: Secret key for session encryption

---

## Installation

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd web_individual_assgn_1
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the database**

   - Create a PostgreSQL database.
   - Run the SQL in `DDL.sql` to create the required tables.

   ```bash
   psql -U <your_db_user> -d <your_db_name> -f DDL.sql
   ```

4. **Configure environment variables**

   - Copy the example above into a `.env` file and fill in your values.

5. **Start the server**

   ```bash
   npm start
   ```

   Or for development with auto-reload:

   ```bash
   npm run dev
   ```

6. **Access the app**

   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### Landing Page

- Accessible at `/`
- Prompts user to sign up or log in

### Sign Up

- Accessible at `/signup`
- Requires username, password, and optional email
- Passwords are hashed before storage

### Login

- Accessible at `/login`
- Login with username or email and password

### Dashboard

- Accessible at `/dashboard` (after login)
- Displays a welcome message and user info

### Admin Panel

- Accessible at `/admin` (only for user `admin`)
- View, filter, and refresh all tracked events

---

## API Endpoints

- `POST /api/signup` — Register a new user
- `POST /api/login` — Authenticate user and start session
- `GET /api/user` — Get current user info (requires authentication)
- `GET /api/admin/events` — Get all events (admin only)
- `POST /track` — Track a new event (requires authentication)

---

## Dependencies

From `package.json`:

- `express` — Web framework
- `bcryptjs` — Password hashing
- `express-session` — Session management
- `body-parser` — Request body parsing
- `pg` — PostgreSQL client
- `dotenv` — Environment variable loader
- `ejs` — Templating engine

Dev dependencies:

- `nodemon` — Development server auto-reload

---

## EJS Templates

- `index.ejs` — Landing page
- `signup.ejs` — Sign up form
- `login.ejs` — Login form
- `dashboard.ejs` — User dashboard
- `admin.ejs` — Admin dashboard for event analytics

All templates use modern, responsive inline CSS for a clean UI.

---

## Security Notes

- Passwords are hashed using bcryptjs before being stored in the database.
- Sessions are stored in memory (for production, use a persistent session store).
- Only the user with username `admin` can access the admin dashboard and event data.





