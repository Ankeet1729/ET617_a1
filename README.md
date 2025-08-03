# User Authentication App

A simple Node.js application with sign up and login functionality built with Express.js.

## Features

- User registration (sign up)
- User authentication (login)
- Session management
- Password hashing with bcrypt
- Beautiful and responsive UI
- File-based user storage

## Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will start on `http://localhost:3000`

## Usage

1. **Home Page** (`/`): Landing page with options to sign up or login
2. **Sign Up** (`/signup`): Create a new user account
3. **Login** (`/login`): Authenticate with existing credentials
4. **Dashboard** (`/dashboard`): Protected page showing "Hello [username]" message
5. **Logout** (`/logout`): End the current session

## Flow

1. User visits the home page
2. User clicks "Sign Up" to create an account
3. After successful signup, user is redirected to login page
4. User logs in with their credentials
5. User is redirected to dashboard showing "Hello [username]" message
6. User can logout to end their session

## File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── users.json            # User data storage (created automatically)
├── public/               # Static files
│   ├── index.html        # Home page
│   ├── signup.html       # Sign up page
│   ├── login.html        # Login page
│   └── dashboard.html    # Dashboard page
└── README.md            # This file
```

## Security Features

- Passwords are hashed using bcrypt
- Session-based authentication
- Input validation
- CSRF protection through session management

## Technologies Used

- **Backend**: Node.js, Express.js
- **Authentication**: bcryptjs, express-session
- **Frontend**: HTML, CSS, JavaScript
- **Storage**: JSON file (for simplicity)

## Notes

- This is a simple demonstration app using file-based storage
- For production use, consider using a proper database
- The session secret should be changed in production
- Users are stored in `users.json` file 