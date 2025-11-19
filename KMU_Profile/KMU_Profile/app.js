const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const app = express();

// Cache setup
const cache = new Map();
const CACHE_TTL = 30000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
}));
app.use(express.static('public'));

// Cache middleware
function cacheMiddleware(req, res, next) {
    const cacheKey = req.path + '|' + (req.get('X-Forwarded-For') || req.ip);
    
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(cached.data);
        return;
    }
    
    const originalSend = res.send;
    res.send = function(data) {
        if (res.statusCode === 200 && typeof data === 'string') {
            cache.set(cacheKey, { data, timestamp: Date.now() });
        }
        originalSend.call(this, data);
    };
    next();
}

// Users database
const users = {
    'admin': {
        id: 1, username: process.env.ADMIN_USER, password: process.env.ADMIN_PASSWORD,
        email: 'admin@company.com', role: 'admin', bio: 'System Administrator',
        joinDate: '2023-01-15', flag: process.env.FLAG || 'KMU{secret_flag_here}'
    },
    'predic': {
        id: 2, username: 'predic', password: 'predic123',
        email: 'predic@company.com', role: 'user', bio: 'Security Researcher',
        joinDate: '2023-03-20'
    },
    'jhanks': {
        id: 3, username: 'jhanks', password: 'jhanks456',
        email: 'jhanks@company.com', role: 'user', bio: 'Security Researcher',
        joinDate: '2023-07-10'
    },
    'alice': {
        id: 4, username: 'alice', password: 'alice789',
        email: 'alice@company.com', role: 'user', bio: 'Product Manager',
        joinDate: '2024-01-05'
    },
    'bob': {
        id: 5, username: 'bob', password: 'bob321',
        email: 'bob@company.com', role: 'user', bio: 'UI/UX Designer',
        joinDate: '2024-02-14'
    }
};

let nextUserId = 6;

// Routes
app.post('/register', (req, res) => {
    const { username, password, email, bio } = req.body;
    
    if (!username || username.length < 3 || !password || password.length < 6 || !email) {
        return res.status(400).json({ success: false, message: 'Invalid input' });
    }
    
    if (users[username]) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    
    users[username] = {
        id: nextUserId++, username, password, email, role: 'user',
        bio: bio || 'No bio provided', joinDate: new Date().toISOString().split('T')[0]
    };
    
    res.json({ success: true, message: 'Registration successful!' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    
    if (user && user.password === password) {
        req.session.user = user;
        res.json({ success: true, user: { username: user.username, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// API endpoint for users list
app.get('/api/users', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const search = req.query.search || '';
    const filteredUsers = Object.values(users).filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.bio.toLowerCase().includes(search.toLowerCase())
    );
    
    res.json({ users: filteredUsers });
});

app.get('/api/current-user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    res.json({ 
        user: { 
            username: req.session.user.username, 
            role: req.session.user.role,
            email: req.session.user.email,
            bio: req.session.user.bio,
            joinDate: req.session.user.joinDate
        } 
    });
});

// Dynamic user profile pages
app.get('/profile/:username', cacheMiddleware, (req, res) => {
    const username = req.params.username;
    const user = users[username];
    
    if (!user) {
        return res.status(404).send('<h1>User not found</h1>');
    }
    
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    let content = `
    <div class="profile-container">
        <div class="profile-header">
            <div class="avatar">${user.username.charAt(0).toUpperCase()}</div>
            <div class="info">
                <h1>${user.username}</h1>
                <p class="role">${user.role.toUpperCase()}</p>
                <p class="join-date">Member since ${user.joinDate}</p>
            </div>
        </div>
        
        <div class="profile-content">
            <div class="section">
                <h3>About</h3>
                <p>${user.bio}</p>
            </div>
            
            <div class="section">
                <h3>Contact</h3>
                <p>Email: ${user.email}</p>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <h4>User ID</h4>
                    <p>#${user.id}</p>
                </div>
                <div class="stat">
                    <h4>Role</h4>
                    <p>${user.role}</p>
                </div>
            </div>`;
    
    if (user.role === 'admin' && req.session.user.role === 'admin') {
        content += `
            <div class="admin-info">
                <h3>🔐 Admin Information</h3>
                <p><strong>System Flag:</strong> <span class="flag">${user.flag}</span></p>
                <p><strong>Admin Level:</strong> Super Administrator</p>
            </div>`;
    } else if (user.role === 'admin') {
        content += `
            <div class="restricted-info">
                <h3>🔒 Restricted Information</h3>
                <p>Admin details are only visible to administrators.</p>
            </div>`;
    }
    
    content += `
        </div>
        <div class="actions">
            <a href="/users.html" class="btn">Back to Directory</a>
        </div>
    </div>`;
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${user.username} - Profile</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        ${content}
    </body>
    </html>
    `);
});

// Report user (triggers bot)
app.post('/report-user', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { reportedUser, reason } = req.body;
    
    if (!users[reportedUser]) {
        return res.status(400).json({ success: false, message: 'User does not exist' });
    }
    
    console.log(`Report: ${req.session.user.username} reported ${reportedUser} - ${reason}`);
    
    // Trigger bot
    setTimeout(() => {
        try {
            const bot = require('./bot.js');
            if (bot && bot.bot) {
                const targetUrl = `http://localhost:3000/profile/${reportedUser}`;
                console.log(`Bot visiting: ${targetUrl}`);
                bot.bot(targetUrl).catch(console.error);
            }
        } catch (error) {
            console.error('Bot error:', error.message);
        }
    }, 1500);
    
    res.json({ success: true, message: 'Report submitted. Admin will review.' });
});

// Admin panel
app.get('/admin', cacheMiddleware, (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Access Denied</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <div class="error-container">
                <h1>🚫 Access Denied</h1>
                <p>Administrator privileges required</p>
            </div>
        </body>
        </html>
        `);
    }
    
    const userStats = Object.values(users);
    const userTableRows = userStats.map(u => 
        `<tr>
            <td>${u.id}</td>
            <td><a href="/profile/${u.username}">${u.username}</a></td>
            <td>${u.email}</td>
            <td><span class="role-${u.role}">${u.role}</span></td>
            <td>${u.joinDate}</td>
        </tr>`
    ).join('');
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Admin Panel</title>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <div class="admin-panel">
            <div class="admin-header">
                <h1>🔐 Admin Control Panel</h1>
                <p>Welcome, <strong>${req.session.user.username}</strong>!</p>
            </div>
            
            <div class="flag-section">
                <h2>🏆 System Flag</h2>
                <div class="flag">${req.session.user.flag}</div>
            </div>
            
            <div class="stats-section">
                <div class="stat-card">
                    <h3>Total Users</h3>
                    <p>${Object.keys(users).length}</p>
                </div>
                <div class="stat-card">
                    <h3>Cache Entries</h3>
                    <p>${cache.size}</p>
                </div>
            </div>
            
            <div class="users-section">
                <h3>User Management</h3>
                <table class="users-table">
                    <thead>
                        <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Join Date</th></tr>
                    </thead>
                    <tbody>${userTableRows}</tbody>
                </table>
            </div>
            
            <div class="actions">
                <a href="/users.html" class="btn">User Directory</a>
                <a href="/dashboard.html" class="btn">Dashboard</a>
                <button onclick="logout()" class="btn btn-danger">Logout</button>
            </div>
        </div>
        
        <script src="/js/main.js"></script>
    </body>
    </html>
    `);
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/debug/cache', (req, res) => {
    const cacheEntries = Array.from(cache.entries()).map(([key, value]) => ({
        key, age: Date.now() - value.timestamp, size: value.data.length
    }));
    res.json({ cache: cacheEntries });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
    // console.log('Users:', Object.keys(users).join(', '));
});