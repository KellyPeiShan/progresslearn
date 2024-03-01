
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Create MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'progresslearn'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Middleware for parsing JSON bodies
app.use(bodyParser.json());

const getUserIdFromToken = (token) => {
    try {
      const decoded = jwt.verify(token, '12345678'); // Verify and decode the token
      return decoded.userId; // Extract user id from the decoded token
    } catch (error) {
      console.error('Error decoding token:', error);
      return null; // Return null if there's an error decoding the token
    }
  };

// Handle sign-up POST request
app.post('/signup', (req, res) => {
  const { fullname, username, password, field, type } = req.body;

  // Check if username is already taken
  const checkUsernameQuery = 'SELECT * FROM user WHERE BINARY username = ?';
  db.query(checkUsernameQuery, [username], (err, results) => {
    if (err) {
      console.error('Error checking username:', err);
      return res.status(500).json({ error: 'An error occurred while checking username' });
    }
    if (results.length > 0) {
      // Username is already taken
      return res.status(400).json({ error: 'Username is already taken' });
    } else {
        // Insert user data into MySQL database
        const sql = 'INSERT INTO user (full_name, username, password, field_of_interest, account_type) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [fullname, username, password, field, type], (err, result) => {
            if (err) {
            console.error('Error signing up:', err);
            return res.status(500).json({ error: 'An error occurred while signing up' });
            }
            console.log('User signed up successfully');
            //Get user id
            const userId = result.insertId; // Get the ID of the last inserted row
            // Create a JWT token with the user ID
            const token = jwt.sign({ userId }, '12345678', { expiresIn: '1h' });

            res.status(200).json({ message: 'User signed up successfully', token });
        });
    }
 });
});

// Handle request to fetch user information
app.get('/userinfo', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
    const userId = getUserIdFromToken(token); // Get user ID from token
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
    }

    // Fetch user information from the database using the user ID
    const getFullNameQuery = 'SELECT full_name FROM user WHERE user_id = ?';
    db.query(getFullNameQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user information:', err);
            return res.status(500).json({ error: 'An error occurred while fetching user information' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // User not found in database
        }
        const fullname = results[0].full_name; // Get the first row of the results
        res.status(200).json({fullname}); // Send user information to the client
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
