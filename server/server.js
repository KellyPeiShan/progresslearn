
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');

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
  
    const courseId = req.body.courseId; 
  
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

  // Handle request to fetch user information
app.get('/instructorinfo', (req, res) => {
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

        // Fetch course information based on instructor id
        const getCourseInfoQuery = `SELECT * FROM course WHERE instructor_id = ?`;        
        db.query(getCourseInfoQuery, [userId], (err, courseResults) => {
            if (err) {
                console.error('Error fetching course information:', err);
                return res.status(500).json({ error: 'An error occurred while fetching course information' });
            }
            res.status(200).json({ fullname, courses: courseResults }); // Send user and course information to the client
        });
    });
});

// Handle course creation
app.post('/createCourse', (req, res) => {
    // Extract user ID from the authorization token
    const token = req.headers.authorization.split(' ')[1];
    const userId = getUserIdFromToken(token);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract course details from the request body
    const { title, description, field } = req.body;

    // Insert new course into the database
    const createCourseQuery = 'INSERT INTO course (course_title, description, course_field, instructor_id) VALUES (?, ?, ?, ?)';
    const values = [title, description, field, userId];

    db.query(createCourseQuery, values, (err, result) => {
        if (err) {
            console.error('Error creating course:', err);
            return res.status(500).json({ error: 'An error occurred while creating the course' });
        }
        res.status(200).json({ message: 'Course created successfully.' });
    });
});

// Endpoint to fetch course information
app.get('/courseinfo/:id', (req, res) => {
    const courseId = req.params.id;
  
    const query = 'SELECT * FROM course WHERE course_id = ?';
    db.query(query, [courseId], (err, result) => {
      if (err) {
        console.error('Error fetching course:', err);
        return res.status(500).json({ error: 'An error occurred while fetching course info' });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      const course = result[0]; //returns only one course
      res.status(200).json(course);
    });
  });

// Define storage for uploaded files
const storage = multer.memoryStorage(); // Store files in memory
  
// Initialize multer upload
const upload = multer({ storage: storage });

// Route handler for adding a new topic
app.post('/addTopic/:courseId', upload.array('files'), (req, res) => {
    const courseId = req.params.courseId;
    if (!courseId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const topicTitle = req.body.title;
    const files = req.files;

    // Count topics for the given course ID
    const countQuery = 'SELECT COUNT(*) AS count FROM topic WHERE course_id = ?';
    db.query(countQuery, [courseId], (countErr, countResult) => {
        if (countErr) {
            console.error('Error counting topics:', countErr);
            return res.status(500).json({ error: 'An error occurred while counting topics' });
        }
        const sequence = countResult[0].count + 1;

        // Insert new topic
        const topicQuery = 'INSERT INTO topic (topic_title, course_id, sequence) VALUES (?, ?, ?)';
        db.query(topicQuery, [topicTitle, courseId, sequence], (topicErr, topicResult) => {
            if (topicErr) {
                console.error('Error adding topic:', topicErr);
                return res.status(500).json({ error: 'An error occurred while adding the topic' });
            }

            // Process uploaded files and insert into files table
            files.forEach(file => {
                // Insert file into files table
                const insertFileQuery = 'INSERT INTO files (file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?)';
                db.query(insertFileQuery, [file.originalname, file.mimetype, file.size, file.buffer], (fileErr, fileResult) => {
                    if (fileErr) {
                        console.error('Error inserting file into database:', fileErr);
                        return res.status(500).json({ error: 'An error occurred while inserting file into database' });
                    }

                    const fileId = fileResult.insertId;

                    // Insert record into topicmaterial table
                    const topicMaterialQuery = 'INSERT INTO topicmaterial (topic_id, file_id) VALUES (?, ?)';
                    db.query(topicMaterialQuery, [topicResult.insertId, fileId], (materialErr, materialResult) => {
                        if (materialErr) {
                            console.error('Error adding topic material:', materialErr);
                            return res.status(500).json({ error: 'An error occurred while adding topic material' });
                        }
                    });
                });
            });

            res.status(200).json({ message: 'Topic added successfully' });
        });
    });
});

// Fetch topics for the given course ID
app.get('/topics/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const topicsQuery = 'SELECT * FROM topic WHERE course_id = ? ORDER BY sequence ASC';
    db.query(topicsQuery, [courseId], (err, topics) => {
        if (err) {
            console.error('Error fetching topics:', err);
            return res.status(500).json({ error: 'An error occurred while fetching topics' });
        }
        // For each topic, fetch topic materials and count quizzes
        const topicsWithMaterials = topics.map(topic => {
            return new Promise((resolve, reject) => {
                const materialsQuery = 'SELECT * FROM topicmaterial WHERE topic_id = ?';
                db.query(materialsQuery, [topic.topic_id], (materialErr, materials) => {
                    if (materialErr) {
                        console.error('Error fetching materials:', materialErr);
                        return reject(materialErr);
                    }
                    // For each topic material, fetch file information
                    const materialsWithFiles = materials.map(material => {
                        return new Promise((resolveMaterial, rejectMaterial) => {
                            const fileQuery = 'SELECT * FROM files WHERE file_id = ?';
                            db.query(fileQuery, [material.file_id], (fileErr, files) => {
                                if (fileErr) {
                                    console.error('Error fetching file:', fileErr);
                                    return rejectMaterial(fileErr);
                                }
                                material.file = files[0];
                                resolveMaterial(material);
                            });
                        });
                    });
                    // Wait for all file queries to complete
                    Promise.all(materialsWithFiles)
                        .then(materials => {
                            topic.materials = materials;
                            // Count quizzes for the current topic
                            const quizCountQuery = 'SELECT COUNT(*) AS quiz_count FROM quiz WHERE topic_id = ?';
                            db.query(quizCountQuery, [topic.topic_id], (quizErr, quizResult) => {
                                if (quizErr) {
                                    console.error('Error counting quizzes:', quizErr);
                                    return reject(quizErr);
                                }
                                topic.quiz_count = quizResult[0].quiz_count;
                                resolve(topic);
                            });
                        })
                        .catch(reject);
                });
            });
        });
        // Wait for all topic queries to complete
        Promise.all(topicsWithMaterials)
            .then(topics => {
                res.status(200).json(topics);
            })
            .catch(err => {
                res.status(500).json({ error: 'An error occurred while fetching topics with materials' });
            });
    });
});


// Endpoint to download files
app.get('/downloadFile/:fileId', (req, res) => {
    const fileId = req.params.fileId;

    getFileDataFromDatabase(fileId)
      .then(fileData => {
        // Set response headers
        res.setHeader('Content-disposition', 'attachment; filename=' + fileData.file_name);
        res.setHeader('Content-type', fileData.file_type);
        // Send the file data as the response
        res.send(fileData.file_data);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'An error occurred while downloading the file' });
      });
  });

  // Function to retrieve file data from the database
function getFileDataFromDatabase(fileId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM files WHERE file_id = ?';
      db.query(query, [fileId], (error, results) => {
        if (error) {
          reject(error);
          return;
        }
  
        if (results.length === 0) {
          reject('File not found');
          return;
        }
  
        const fileData = results[0];
        resolve(fileData);
      });
    });
  }

  // Route handler for adding additional material
app.post('/addAM/:courseId', upload.array('files'), (req, res) => {
    const courseId = req.params.courseId;
    if (!courseId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const files = req.files;

    // Process uploaded files and insert into files table
    files.forEach(file => {
        // Insert file into files table
        const insertFileQuery = 'INSERT INTO files (file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?)';
        db.query(insertFileQuery, [file.originalname, file.mimetype, file.size, file.buffer], (fileErr, fileResult) => {
            if (fileErr) {
                console.error('Error inserting file into database:', fileErr);
                return res.status(500).json({ error: 'An error occurred while inserting file into database' });
            }

            const fileId = fileResult.insertId;

            // Insert record into additional material table
            const insertMaterialQuery = 'INSERT INTO additionalmaterial (file_id, course_id) VALUES (?, ?)';
            db.query(insertMaterialQuery, [fileId, courseId], (materialErr, materialResult) => {
                if (materialErr) {
                    console.error('Error adding additional material:', materialErr);
                    return res.status(500).json({ error: 'An error occurred while adding additional material' });
                }
            });
        });
    });

    res.status(200).json({ message: 'Additional Material edited successfully' });
    
});

// Fetch additional materials for the given course ID
app.get('/getAM/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const additionalMaterialsQuery = 'SELECT * FROM additionalmaterial WHERE course_id = ?';
    db.query(additionalMaterialsQuery, [courseId], (err, additionalMaterials) => {
        if (err) {
            console.error('Error fetching additional materials:', err);
            return res.status(500).json({ error: 'An error occurred while fetching additional materials' });
        }

        // For each additional material, fetch file information
        const additionalMaterialsWithFiles = additionalMaterials.map(material => {
            return new Promise((resolve, reject) => {
                const fileQuery = 'SELECT * FROM files WHERE file_id = ?';
                db.query(fileQuery, [material.file_id], (fileErr, files) => {
                    if (fileErr) {
                        console.error('Error fetching file:', fileErr);
                        return reject(fileErr);
                    }
                    material.file = files[0];
                    resolve(material);
                });
            });
        });

        // Wait for all file queries to complete
        Promise.all(additionalMaterialsWithFiles)
            .then(materials => {
                res.status(200).json(materials);
            })
            .catch(err => {
                res.status(500).json({ error: 'An error occurred while fetching additional materials with files' });
            });
    });
});

// Endpoint to handle deletion of additional material
app.delete('/deleteAM/:materialId', (req, res) => {
    const materialId = req.params.materialId;
    
    // Query to delete the material from the database
    const deleteMaterialQuery = 'DELETE FROM additionalmaterial WHERE am_id = ?';
    
    db.query(deleteMaterialQuery, [materialId], (err, result) => {
      if (err) {
        console.error('Error deleting material:', err);
        return res.status(500).json({ error: 'An error occurred while deleting material' });
      }
  
      // Check if any rows were affected by the deletion
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }
  
      // Send success response
      res.status(200).json({ message: 'Material deleted successfully' });
    });
  });

// Route handler for adding topic material
app.post('/addTM/:topicId', upload.array('files'), (req, res) => {
    const topicId = req.params.topicId;
    if (!topicId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const files = req.files;

    // Process uploaded files and insert into files table
    files.forEach(file => {
        // Insert file into files table
        const insertFileQuery = 'INSERT INTO files (file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?)';
        db.query(insertFileQuery, [file.originalname, file.mimetype, file.size, file.buffer], (fileErr, fileResult) => {
            if (fileErr) {
                console.error('Error inserting file into database:', fileErr);
                return res.status(500).json({ error: 'An error occurred while inserting file into database' });
            }

            const fileId = fileResult.insertId;

            // Insert record into topic material table
            const insertMaterialQuery = 'INSERT INTO topicmaterial (file_id, topic_id) VALUES (?, ?)';
            db.query(insertMaterialQuery, [fileId, topicId], (materialErr, materialResult) => {
                if (materialErr) {
                    console.error('Error adding topic material:', materialErr);
                    return res.status(500).json({ error: 'An error occurred while adding topic material' });
                }
            });
        });
    });

    res.status(200).json({ message: 'Topic Material edited successfully' });
    
});

// Endpoint to handle deletion of topic material
app.delete('/deleteTM/:materialId', (req, res) => {
    const materialId = req.params.materialId;
    
    // Query to delete the material from the database
    const deleteMaterialQuery = 'DELETE FROM topicmaterial WHERE tm_id = ?';
    
    db.query(deleteMaterialQuery, [materialId], (err, result) => {
      if (err) {
        console.error('Error deleting material:', err);
        return res.status(500).json({ error: 'An error occurred while deleting material' });
      }
  
      // Check if any rows were affected by the deletion
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Material not found' });
      }
  
      // Send success response
      res.status(200).json({ message: 'Material deleted successfully' });
    });
  });

// Endpoint to handle updating announcement
app.put('/updateAnnouncement/:courseId', (req, res) => {
    const { courseId } = req.params;
    const { announcement } = req.body;
    
    // Query to update the announcement in the database
    const updateAnnouncementQuery = 'UPDATE course SET announcement = ? WHERE course_id = ?';
    
    db.query(updateAnnouncementQuery, [announcement, courseId], (err, result) => {
        if (err) {
            console.error('Error updating announcement:', err);
            return res.status(500).json({ error: 'An error occurred while updating announcement' });
        }

        // Check if any rows were affected by the update
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Send success response
        res.status(200).json({ message: 'Announcement updated successfully' });
    });
});

// End point for fetching student progress by course
app.get('/studentProgressByCourse/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    
    // Query to select student progress and calculate max_progress
    const query = `
        SELECT e.student_id, e.progress, u.full_name, (
            SELECT COUNT(*) FROM topic WHERE course_id = ?
        ) AS max_progress
        FROM enrollment e
        JOIN user u ON e.student_id = u.user_id
        WHERE e.course_id = ?
    `;
    
    db.query(query, [courseId, courseId], (err, result) => {
        if (err) {
            console.error('Error fetching student progress:', err);
            return res.status(500).json({ error: 'An error occurred while fetching student progress' });
        }

        // Send result to the frontend
        res.status(200).json(result);
    });
});

// End point for fetching topic info
app.get('/topicinfo/:topicId', (req, res) => {
    const topicId = req.params.topicId;

    const query = `SELECT topic_title FROM topic WHERE topic_id = ?`;

    db.query(query, [topicId], (err, result) => {
        if (err) {
            console.error('Error fetching topic information:', err);
            return res.status(500).json({ error: 'An error occurred while fetching topic information' });
        }
        const topicinfo = result[0];
        res.status(200).json(topicinfo);
    });

});

// end point for adding quiz
app.post('/addQuiz', (req, res) => {
    const { topicId, questionNumber, questions, passingRate } = req.body;
  
    // Insert into quiz table
    db.query('INSERT INTO quiz (topic_id, pass_rate, no_of_ques) VALUES (?, ?, ?)', [topicId, passingRate, questionNumber], (err, result) => {
      if (err) {
        console.error('Error adding quiz:', err);
        return res.status(500).json({ error: 'An error occurred while adding quiz' });
      }
  
      // Get the inserted quiz ID
      const quizId = result.insertId;
  
      // Insert questions into question table
      questions.forEach(question => {
        db.query('INSERT INTO question (quiz_id, question, selection_1, selection_2, selection_3, selection_4, answer) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [quizId, question.question, question.selections[0], question.selections[1], question.selections[2], question.selections[3], question.answer],
          (err, result) => {
            if (err) {
              console.error('Error adding question:', err);
              return res.status(500).json({ error: 'An error occurred while adding questions' });
            }
          });
      });
  
      res.status(200).json({ message: 'Quiz added successfully' });
    });
  });

// Fetch topics for the given course ID for student
app.get('/studenttopics/:courseId', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
    const userId = getUserIdFromToken(token); // Get user ID from token
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
    }
    const courseId = req.params.courseId;
    const topicsQuery = 'SELECT * FROM topic WHERE course_id = ? ORDER BY sequence ASC';
    db.query(topicsQuery, [courseId], (err, topics) => {
        if (err) {
            console.error('Error fetching topics:', err);
            return res.status(500).json({ error: 'An error occurred while fetching topics' });
        }
        // For each topic, fetch topic materials and count quizzes
        const topicsWithMaterialsAndQuizResults = topics.map(topic => {
            return new Promise((resolve, reject) => {
                const materialsQuery = 'SELECT * FROM topicmaterial WHERE topic_id = ?';
                db.query(materialsQuery, [topic.topic_id], (materialErr, materials) => {
                    if (materialErr) {
                        console.error('Error fetching materials:', materialErr);
                        return reject(materialErr);
                    }
                    // For each topic material, fetch file information
                    const materialsWithFiles = materials.map(material => {
                        return new Promise((resolveMaterial, rejectMaterial) => {
                            const fileQuery = 'SELECT * FROM files WHERE file_id = ?';
                            db.query(fileQuery, [material.file_id], (fileErr, files) => {
                                if (fileErr) {
                                    console.error('Error fetching file:', fileErr);
                                    return rejectMaterial(fileErr);
                                }
                                material.file = files[0];
                                resolveMaterial(material);
                            });
                        });
                    });
                    // Wait for all file queries to complete
                    Promise.all(materialsWithFiles)
                        .then(materials => {
                            topic.materials = materials;
                            // Count quizzes for the current topic
                            const quizCountQuery = 'SELECT COUNT(*) AS quiz_count FROM quiz WHERE topic_id = ?';
                            db.query(quizCountQuery, [topic.topic_id], (quizErr, quizResult) => {
                                if (quizErr) {
                                    console.error('Error counting quizzes:', quizErr);
                                    return reject(quizErr);
                                }
                                topic.quiz_count = quizResult[0].quiz_count;
                                
                                // Fetch quiz result for the current topic
                                const selectQuizQuery = 'SELECT quiz_id FROM quiz WHERE topic_id = ?';
                                db.query(selectQuizQuery, [topic.topic_id], (selectQuizErr, selectQuizResult) => {
                                    if (selectQuizErr) {
                                        console.error('Error selecting quiz:', selectQuizErr);
                                        return reject(selectQuizErr);
                                    }
                                    
                                    if (selectQuizResult.length > 0) {
                                        const quizId = selectQuizResult[0].quiz_id;
                                        const checkPerformanceQuery = 'SELECT MAX(score) AS score FROM quizperformance WHERE quiz_id = ? AND student_id = ?';
                                        db.query(checkPerformanceQuery, [quizId, userId], (performanceErr, performanceResult) => {
                                            if (performanceErr) {
                                                console.error('Error fetching performance:', performanceErr);
                                                return reject(performanceErr);
                                            }
                                            topic.quizResult = performanceResult.length > 0 ? { score: performanceResult[0].score } : null;
                                            resolve(topic);
                                        });
                                        
                                    } else {
                                        // No quiz found for the topic
                                        topic.quizResult = null;
                                        resolve(topic);
                                    }
                                });
                            });
                        })
                        .catch(reject);
                });
            });
        });
        // Wait for all topic queries to complete
        Promise.all(topicsWithMaterialsAndQuizResults)
            .then(topics => {
                res.status(200).json(topics);
            })
            .catch(err => {
                res.status(500).json({ error: 'An error occurred while fetching topics with materials and quiz results' });
            });
    });
});

// Fetch student progress with course id and user id
app.get('/studentProgress/:courseId', (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
    const userId = getUserIdFromToken(token); // Get user ID from token
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
    }
    const courseId = req.params.courseId;

    const query = `
        SELECT 
            progress, 
            (SELECT COUNT(topic.course_id) FROM topic WHERE topic.course_id = ?) AS max_progress
        FROM 
            enrollment 
        WHERE 
            student_id = ? AND course_id = ?
    `;

    db.query(query, [courseId, userId, courseId], (err, result) => {
        if (err) {
            console.error('Error fetching topic information:', err);
            return res.status(500).json({ error: 'An error occurred while fetching topic information' });
        }
        const studentprogress = result[0];
        res.status(200).json(studentprogress);
    });

});

//end point for submitting feedback
app.post('/submitFeedback/:courseId', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
        const userId = getUserIdFromToken(token); // Get user ID from token
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
        }

        const { feedback } = req.body;
        const courseId = req.params.courseId;

        // Insert feedback into the database
        const insertFeedbackQuery = 'INSERT INTO feedback (content, course_id, student_id) VALUES (?, ?, ?)';
        db.query(insertFeedbackQuery, [feedback, courseId, userId], (err, result) => {
            if (err) {
                console.error('Error inserting feedback:', err);
                return res.status(500).json({ error: 'An error occurred while inserting feedback' });
            }
            // Return success message
            res.status(200).json({ message: 'Feedback submitted successfully' });
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        return res.status(500).json({ error: 'An error occurred while submitting feedback' });
    }
});

//end point to fetch feedbacks
app.get('/getFeedback/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    const query = `
      SELECT feedback.feedback_id, feedback.content, user.full_name 
      FROM feedback 
      INNER JOIN user ON feedback.student_id = user.user_id 
      WHERE feedback.course_id = ?`;
    
    db.query(query, [courseId], (err, feedbacks) => {
      if (err) {
        console.error('Error fetching feedback:', err);
        return res.status(500).json({ error: 'An error occurred while fetching feedback' });
      }
      res.status(200).json(feedbacks);
    });
  });

// Endpoint to fetch quiz and its questions based on the topicId
app.get('/fetchQuiz/:topicId', (req, res) => {
    const { topicId } = req.params;
    
    // Query to fetch quiz based on the topicId
    const quizQuery = 'SELECT * FROM quiz WHERE topic_id = ?';
    
    db.query(quizQuery, [topicId], (err, quizResult) => {
      if (err) {
        console.error('Error fetching quiz:', err);
        return res.status(500).json({ error: 'An error occurred while fetching quiz' });
      }
      
      if (quizResult.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
      }
      
      const quiz = quizResult[0];
      
      // Query to fetch questions for the quiz
      const questionsQuery = 'SELECT * FROM question WHERE quiz_id = ?';
    
      db.query(questionsQuery, [quiz.quiz_id], (err, questionsResult) => {
        if (err) {
          console.error('Error fetching questions:', err);
          return res.status(500).json({ error: 'An error occurred while fetching questions' });
        }
        
        // Add questions array to the quiz object
        quiz.questions = questionsResult;
        
        res.status(200).json(quiz);
      });
    });
  });

  // Endpoint to handle the submission of quiz performance data
app.post('/submitQuiz/:quizId', (req, res) => {

    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
    const userId = getUserIdFromToken(token); // Get user ID from token
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
    }
    const quizId = req.params.quizId;
    const { percentage, incorrectlyAnswered } = req.body;
  
    // Insert into quiz performance table
    const insertQuery = 'INSERT INTO quizperformance (score, quiz_id, student_id) VALUES (?, ?, ?)';
    db.query(insertQuery, [percentage, quizId, userId], (err, result) => {
      if (err) {
        console.error('Error inserting quiz performance:', err);
        return res.status(500).json({ error: 'An error occurred while inserting quiz performance' });
      }
  
      // Update incorrect_times column in the question table for incorrectly answered questions
      const updateQuery = 'UPDATE question SET incorrect_times = incorrect_times + 1 WHERE question_id IN (?)';
      db.query(updateQuery, [incorrectlyAnswered], (err, result) => {
        if (err) {
          console.error('Error updating incorrect times:', err);
          return res.status(500).json({ error: 'An error occurred while updating incorrect times' });
        }
        res.status(200).json({ message: 'Quiz submitted successfully' });
      });
    });
  });
  
// Endpoint to update the progress column in enrollment table
app.put('/updateProgress/:courseId', (req, res) => {
    const { courseId } = req.params;
    const token = req.headers.authorization.split(' ')[1]; // Extract token from headers
    const userId = getUserIdFromToken(token); // Get user ID from token
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' }); // Unauthorized if token is invalid
    }
  
    // Update progress in the enrollment table
    const updateQuery = 'UPDATE enrollment SET progress = progress + 1 WHERE student_id = ? AND course_id = ?';
    db.query(updateQuery, [userId, courseId], (err, result) => {
      if (err) {
        console.error('Error updating progress:', err);
        return res.status(500).json({ error: 'An error occurred while updating progress' });
      }
      res.status(200).json({ message: 'Progress updated successfully' });
    });
  });

// Endpoint to fetch overall quiz performance
app.get('/quizPerformance/:courseId', (req, res) => {
    try {
      const courseId = req.params.courseId;
  
      // Fetch topicIds for the given courseId
      db.query('SELECT topic_id, topic_title FROM topic WHERE course_id = ? ORDER BY sequence ASC', [courseId], (err, topics) => {
        if (err) {
          console.error('Error fetching topics:', err);
          return res.status(500).json({ error: 'An error occurred while fetching topics' });
        }
  
        // Initialize array to store overall performance
        const quizPerformance = [];
  
        // Use map instead of forEach to preserve order
        Promise.all(topics.map(topic => {
          return new Promise((resolve, reject) => {
            const topicId = topic.topic_id;
            const topicTitle = topic.topic_title;
            const topicData = {
              topic_id: topicId,
              topic_title: topicTitle,
              quiz: null // Default to null
            };
  
            // Fetch quizId for the current topicId
            db.query('SELECT quiz_id FROM quiz WHERE topic_id = ?', [topicId], (err, quizzes) => {
              if (err) {
                console.error('Error fetching quiz:', err);
                return reject({ error: 'An error occurred while fetching quiz' });
              }
  
              // If a quiz exists for the current topic, fetch additional data
              if (quizzes.length > 0) {
                const quizId = quizzes[0].quiz_id;
                // Fetch avg score for the current quizId
                db.query('SELECT AVG(score) AS avg_score FROM quizperformance WHERE quiz_id = ?', [quizId], (err, avgScoreResult) => {
                  if (err) {
                    console.error('Error fetching average score:', err);
                    return reject({ error: 'An error occurred while fetching average score' });
                  }
                  const avgScore = avgScoreResult[0].avg_score;
  
                  // Fetch max score for each student in the current quiz
                  db.query(`SELECT qp.student_id, u.full_name, MAX(qp.score) AS max_score 
                            FROM quizperformance qp
                            JOIN user u ON qp.student_id = u.user_id
                            WHERE qp.quiz_id = ?
                            GROUP BY qp.student_id`, [quizId], (err, studentPerformance) => {
                    if (err) {
                      console.error('Error fetching student performance:', err);
                      return reject({ error: 'An error occurred while fetching student performance' });
                    }
  
                    // Fetch question performance for the current quiz
                    db.query('SELECT question, incorrect_times FROM question WHERE quiz_id = ?', [quizId], (err, questionPerformance) => {
                      if (err) {
                        console.error('Error fetching question performance:', err);
                        return reject({ error: 'An error occurred while fetching question performance' });
                      }
  
                      // Add quiz data to topic data
                      topicData.quiz = {
                        quiz_id: quizId,
                        avgScore: avgScore,
                        studentPerformance: studentPerformance,
                        questionPerformance: questionPerformance
                      };
                      resolve(topicData);
                    });
                  });
                });
              } else {
                // Resolve with topic data (without quiz data) if no quiz exists
                resolve(topicData);
              }
            });
          });
        })).then(result => {
          // Push the resolved data into the quizPerformance array
          result.forEach(data => {
            quizPerformance.push(data);
          });
          res.status(200).json(quizPerformance);
        }).catch(error => {
          console.error('Error fetching quiz performance:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
      });
    } catch (error) {
      console.error('Error fetching quiz performance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
