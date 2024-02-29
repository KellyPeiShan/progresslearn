// server.js
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

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

// Handle sign-up POST request
app.post('/signup', (req, res) => {
  const { fullname, username, password, field, type } = req.body;

  // Optional: Validate user input
  // For example, check if required fields are provided, validate email format, etc.

  // Insert user data into MySQL database
  const sql = 'INSERT INTO user (username, password, full_name, field_of_interest, account_type) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [fullname, username, password, field, type], (err, result) => {
    if (err) {
      console.error('Error signing up:', err);
      return res.status(500).json({ error: 'An error occurred while signing up' });
    }
    console.log('User signed up successfully');
    res.status(200).json({ message: 'User signed up successfully' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
