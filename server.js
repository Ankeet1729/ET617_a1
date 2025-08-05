const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Database connected successfully');
    }
});

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Database helper functions
async function createUser(username, passwordHash, email = null) {
    const query = 'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING username, email';
    const values = [username, passwordHash, email];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

async function findUserByUsername(username) {
    const query = 'SELECT username, password_hash, email FROM users WHERE username = $1';
    const values = [username];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
}

async function findUserByEmail(email) {
    const query = 'SELECT username, password_hash, email FROM users WHERE email = $1';
    const values = [email];
    
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
}

async function findUserByUsernameOrEmail(identifier) {
    // Helper for login: allow login by username or email
    const query = 'SELECT username, password_hash, email FROM users WHERE username = $1 OR email = $1';
    const values = [identifier];
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
}

// Since username is the PK, we use username for session/user lookup
async function findUserByUsernameOnly(username) {
    const query = 'SELECT username, email FROM users WHERE username = $1';
    const values = [username];
    try {
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (error) {
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.render('index', { 
            title: 'Welcome',
            message: 'Please sign up or log in to continue'
        });
    }
});

app.get('/signup', (req, res) => {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.render('signup', { 
            title: 'Sign Up',
            error: null,
            success: null
        });
    }
});

app.get('/login', (req, res) => {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.render('login', { 
            title: 'Login',
            error: null,
            success: null
        });
    }
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.username) {
        res.redirect('/login');
    } else {
        try {
            const user = await findUserByUsernameOnly(req.session.username);
            if (!user) {
                req.session.destroy();
                return res.redirect('/login');
            }
            res.render('dashboard', { 
                title: 'Dashboard',
                username: user.username
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.redirect('/login');
        }
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// API Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check if user already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user in database
        const newUser = await createUser(username, hashedPassword, email || null);
        
        res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Find user in database (by username or email)
        const user = await findUserByUsernameOrEmail(username);
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid username or password' });
        }
        
        // Set session (store username as PK)
        req.session.username = user.username;
        
        res.json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/user', async (req, res) => {
    if (!req.session.username) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    try {
        const user = await findUserByUsernameOnly(req.session.username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ username: user.username, email: user.email });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/track', express.json(), (req, res) => {
    const { event_type, target_type, target_id, event_data } = req.body;
    const username = req.session.username;
    if (!username) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!event_type || !target_type || target_id === undefined) {
        console.error('Missing required fields for event tracking:', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const query = `INSERT INTO events (username, event_type, target_type, target_id, event_data) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`;
    const values = [username, event_type, target_type, target_id, event_data || null];
    // console.log(values);
    // console.log('reached');

    pool.query(query, values)
        .then(result => {
            res.status(201).json({ success: true, event: result.rows[0] });
        })
        .catch(error => {
            console.error('Error tracking event:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
}); 

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 