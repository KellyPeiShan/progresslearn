
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

//function to get user id from token
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

// Handle login POST request
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username exists in the database
    const checkUsernameQuery = 'SELECT user_id, password, account_type FROM user WHERE BINARY username = ?';
    db.query(checkUsernameQuery, [username], (err, results) => {
        if (err) {
            console.error('Error checking username:', err);
            return res.status(500).json({ error: 'An error occurred while checking username' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' }); // Username not found
        }

        // Validate the password
        const user = results[0]; // Get the first row of the results
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' }); // Incorrect password
        }

        // Generate a token using the user ID as the sign
        const token = jwt.sign({ userId: user.user_id }, '12345678', { expiresIn: '1h' });
        // Determine account type
        const type = user.account_type;

        res.status(200).json({ message: 'Login successful', token, type });
    });
});


// Handle request to fetch user information
app.get('/studentinfo', (req, res) => {
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

        // Fetch course information based on student's enrollment
        const getCourseInfoQuery = `
        SELECT 
            course.course_id, 
            course.course_title, 
            course.course_field, 
            enrollment.progress,
            (SELECT COUNT(topic.course_id) FROM topic WHERE topic.course_id = course.course_id) AS max_progress
        FROM 
            course 
        INNER JOIN 
            enrollment ON course.course_id = enrollment.course_id
        WHERE 
            enrollment.student_id = ?`;        
        db.query(getCourseInfoQuery, [userId], (err, courseResults) => {
            if (err) {
                console.error('Error fetching course information:', err);
                return res.status(500).json({ error: 'An error occurred while fetching course information' });
            }
            res.status(200).json({ fullname, courses: courseResults }); // Send user and course information to the client
        });
    });
});

// Handle request to search for new courses
app.get('/searchCourses', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
    const userId = getUserIdFromToken(token); // Get user ID from token
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
    }

    const query = req.query.query; // Get the search query from the request

    // Query to search for courses matching the query in course_title
    const searchQuery = 'SELECT * FROM course WHERE course_title LIKE ?';
    // Query to find course IDs that the user has already enrolled in
    const enrolledCoursesQuery = 'SELECT course_id FROM enrollment WHERE student_id = ?';

    // Execute the queries
    db.query(searchQuery, [`%${query}%`], (err, searchResults) => {
        if (err) {
            console.error('Error searching for courses:', err);
            return res.status(500).json({ error: 'An error occurred while searching for courses' });
        }

        // Extract course IDs from the search results
        const enrolledCourses = searchResults.map(course => course.course_id);

        // Execute the query to find enrolled courses for the user
        db.query(enrolledCoursesQuery, [userId], (enrollErr, enrolledCourseIds) => {
            if (enrollErr) {
                console.error('Error fetching enrolled courses:', enrollErr);
                return res.status(500).json({ error: 'An error occurred while fetching enrolled courses' });
            }

            // Extract course IDs from the enrolled courses query results
            const enrolledIds = enrolledCourseIds.map(enrollment => enrollment.course_id);

            // Filter out courses that the user has already enrolled in
            const availableCourses = searchResults.filter(course => !enrolledIds.includes(course.course_id));

            res.status(200).json({ results: availableCourses });
        });
    });
});

// Handle enrollment
app.post('/enroll', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  
    const courseId = req.body.courseId; // Assuming courseId is sent in the request body
  
    const enrollQuery = 'INSERT INTO enrollment (student_id, course_id, progress) VALUES (?, ?, ?)';
    const values = [userId, courseId, 0];
  
    db.query(enrollQuery, values, (err, result) => {
      if (err) {
        console.error('Error enrolling:', err);
        return res.status(500).json({ error: 'An error occurred while enrolling in the course' });
      }
      res.status(200).json({ message: 'Enrolled successfully.' });
    });
  });


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
