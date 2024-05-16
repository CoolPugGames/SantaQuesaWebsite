const express = require('express');
const sqlite3 = require('sqlite3');
const fetchDataFromDatabase = require('./server/fetchData.js');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const path = require('path');

// Absolute path to the root folder
const rootPath = __dirname;
const publicFolderPath = path.join(__dirname, 'public');
const protectedFolderPath = path.join(__dirname, 'protected');


const app = express();
const port = 3000;
const saltRounds = 10;




app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.use(express.json());

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.redirect('/login.html'); // Redirect to login page if not authenticated
};


app.use('/protected', isAuthenticated, express.static(protectedFolderPath));

app.use(express.static(publicFolderPath));


// SQLite database setup
const db = new sqlite3.Database('./database/SQdata.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the database.');
    }
  });



app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Step 1: Retrieve hashed password and UserID from the database based on the entered username
  const query = 'SELECT UserID, HashedPassword FROM User_Passwords_Hashed WHERE Username = ?';
  db.get(query, [username], async (err, row) => {
    if (err) {
      console.error('Error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'User does not exist' });
    }
    const hashedPassword = row.HashedPassword;
    // Step 2: Compare hashed password with the entered password
    bcrypt.compare(password, hashedPassword, (err, result) => {
      if (err) {
          console.error('Error:', err.message);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }

      if (result) {
          // Authentication successful
          const roleQuery = 'SELECT Role FROM User_Roles WHERE UserID = ?';
          db.get(roleQuery, [row.UserID], async (roleErr, roleRow) => {
            if (roleErr) {
              return res.status(500).json({ error: 'Database error' });
            }

            if (!roleRow) {
              return res.status(401).json({ error: 'User role not found' });
            }

            // Step 3: Store the user's role in the session or response payload
            console.log(row.UserID, ' :: ', roleRow.Role)
            req.session.authenticated = true;
            req.session.role = roleRow.Role; // Assuming role is stored in the 'Role' column
            req.session.UserID = row.UserID;
            req.session.username = username;
            res.json({ message: 'Login successful', ok: true });
          });
      } else {
          // Invalid password
          res.status(401).json({ error: 'Invalid username or password', ok: false });
      }
    });
  });
});

app.post('/login_old', async (req, res) => {
  const { username, password } = req.body;

  // Step 1: Retrieve hashed password and UserID from the database based on the entered username
  const query = 'SELECT UserID, Password FROM User_Passwords WHERE Username = ?';
  db.get(query, [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!row) {
      return res.status(401).json({ error: 'User does not exist' });
    }

    // Compare hashed password with the entered password
    const match = (password == row.Password);

    if (match) {
      // Step 2: Fetch the user's role using the obtained UserID
      const roleQuery = 'SELECT Role FROM User_Roles WHERE UserID = ?';
      db.get(roleQuery, [row.UserID], async (roleErr, roleRow) => {
        if (roleErr) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!roleRow) {
          return res.status(401).json({ error: 'User role not found' });
        }

        // Step 3: Store the user's role in the session or response payload
        console.log(row.UserID, ' :: ', roleRow.Role)
        req.session.authenticated = true;
        req.session.role = roleRow.Role; // Assuming role is stored in the 'Role' column
        req.session.UserID = row.UserID;
        res.json({ message: 'Login successful', ok: true });
      });
    } else {
      res.status(401).json({ error: 'Invalid username or password', ok: false });
    }
  });
});

// get the user's role and userID
app.get('/session', (req, res) => {
  res.json({ 
    role: req.session.role,
    userID: req.session.UserID
  }); // Send session data to client
});

// only navigate to the protected folder if user is authenticated
app.get('/protected/mysantaquesa.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(protectedFolderPath, 'mysantaquesa.html'));
});

// Check authentication for login to database page

app.get('/check-auth', (req, res) => {
  // Check if the user is authenticated
  if (req.session.authenticated) {
      res.json({ authenticated: true });
  } else {
      res.json({ authenticated: false });
  }
});


// API endpoint to fetch column names for a specific table
app.get('/api/columns', (req, res) => {
    const tableName = req.query.table;
    const columnList = req.query.columnList;
    const filteredColumns = '';
  
    // Retrieve column names for the specified table
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        console.error('Error fetching column names:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
      } else {
        // Extract column names
        const columnNames = columns.map((column) => column.name);
        res.json(columnNames);
      }
    });
  });
  
// Endpoint to handle data requests. 
// Takes a list of column names, returns those columns for all rows.
app.get('/api/data', (req, res) => {
    const tableName = req.query.table;
    const columnList = req.query.columnList;
  
    if (!tableName) {
      return res.status(400).json({ error: 'Table name not provided.' });
    }
  
    // Query the database based on the provided table name
    // const query = `SELECT * FROM ${tableName}`;
    const query = `SELECT ${columnList} FROM ${tableName}`;
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error executing query:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
      }
  
      res.json(rows);
    });
  });

  // Endpoint to fetch one row from a data table
app.get('/api/dataRow', (req, res) => {
    const tableName = req.query.table; // name of the table to search
    const columnList = req.query.columnList; // list of columns to retrieve
    const searchKey = req.query.searchKey; // name of column to search, i.e. UserID
    const searchValue = req.query.searchValue; // value to search for in the Key column
  
    if (!tableName) {
      return res.status(400).json({ error: 'Table name not provided.' });
    }
  
    // Query the database based on the provided table name
    const query = `SELECT ${columnList} FROM ${tableName} WHERE ${searchKey} = ?`;
    db.get(query, [searchValue], (err, row) => {
      if (err) {
        console.error('Error executing query:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
      }
  
      res.json(row);
    });
  });

  // Endpoint for retrieving data from multiple rows of a data table
app.get('/api/dataRows', (req, res) => {
    const tableName = req.query.table; // name of table
    const columnList = req.query.columnList; // list of columns to retrieve
    const searchKey = req.query.searchKey; // name of column to search, i.e. UserID
    let searchValues = req.query.searchValues; // values to search for in Key column, i.e. a list of UserIds
    console.log('searchValues = ',searchValues, Array.isArray(searchValues));
    if (!Array.isArray(searchValues)) {
      // Assuming studentIDs is provided as a comma-separated string
      searchValues = searchValues.split(',');
    }
    const placeholders = searchValues.map(()=> '?').join(',');
    console.log('searchValues = ',searchValues, Array.isArray(searchValues));

    if (!tableName) {
      return res.status(400).json({ error: 'Table name not provided.' });
    }
    // console.log(columnList);
    // console.log(tableName);
    // console.log(searchKey);
  
    // Query the database based on the provided table name
    const query = `SELECT ${columnList} FROM ${tableName} WHERE ${searchKey} IN (${placeholders})`;
    // const query = `SELECT FirstName, LastName, StudentID, ClassesAndGrades FROM Student_Data WHERE StudentID IN (${placeholders})`;

    db.all(query, searchValues, (err, row) => {
      if (err) {
        console.error('Error executing query:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
      }
  
      res.json(row);
    });
  });

  // Endpoint to get all the grades of a specified student
app.get('/api/gradeList', (req, res) => {
  const userID = req.query.userID; // student's UserID
  const query = `SELECT FirstName, LastName, ClassesAndGrades FROM Student_Data WHERE StudentID = ?`;
  db.get(query, [userID], (err, row) => {
    if (err) {
      console.error('Error executing grade list query:', err.message);
      return res.status(500).json({ error: 'Internal server error.'});
    }
    res.json(row);
  })
})

// Endpoint to search the EmployeeData table to find the Subject of a class using a given Classcode
app.get('/api/subjectFromClassCode', (req, res) => {
  const classCode = req.query.classCode;
  console.log('Accessing ClassCode: ',classCode);
  const query = 'SELECT FirstName, LastName, Subject FROM Employee_Data WHERE ClassCode = ? ';
  db.get(query, [classCode], (err, row) => {
    if (err) {
      console.error('Error executing classCode query:', err.message);
      return res.status(500).json({ error: 'Internal server error.'});
    }
    res.json(row);
  }) 
});

// Endpoint to return the ClassCode for a given EmployeeID
app.get('/api/classCode', (req, res) => {
    const userID = req.query.userID;
    
    const query = 'SELECT LastName, ClassCode, Subject FROM Employee_Data WHERE EmployeeID = ? ';
    db.get(query, [userID], (err, row) => {
      if (err) {
        console.error('Error executing query:', err.message);
        return res.status(500).json({ error: 'Internal server error.'});
      }
      res.json(row);
    })
});

// Endpoint to return a list of studentIDs that are enrolled in a given CourseID
app.get('/api/classRoster', (req, res) => {
  const classCode = req.query.classCode;
  const query = 'SELECT Students FROM Class_Rosters WHERE CourseID = ? ';
  db.get(query, [classCode], (err, row) => {
    if (err) {
      console.error('Error executing query:', err.message);
      return res.status(500).json({ error: 'Internal server error.'});
    }
    res.json(row);
  })
});


// endpoint to logout user from database and authentication
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login.html');
  });
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
