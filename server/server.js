const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 5000;

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'progresslearn'
});

connection.connect();

// Middleware
app.use(bodyParser.json());

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;

    connection.query(query, [username, password], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        if (results.length === 1) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
