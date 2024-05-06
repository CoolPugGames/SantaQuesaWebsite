// mysantaquesa.js

// Assume the userRole variable contains the user's role (e.g., 'teacher', 'student', 'admin')
let userRole = 'none'; // This value should come from the server-side response
let tableName = 'none';
let searchKey = 'none';
let columnList = 'All';
let allColumns = '*';
let userID = '';
let elementID = 'dbList';
let elementToClear = "dbList_part2";
let buttonData = 'None';

document.getElementById('personalInfoButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    const searchValue = userID;
    if (userRole === 'Student') {
      tableName = 'Student_Data';
      searchKey = 'StudentID';
      columnList = ['FirstName','LastName','StudentID','Email','Phone','Address'];
    } else {
      tableName = 'Employee_Data';
      searchKey = 'EmployeeID';
      columnList = ['FirstName','LastName','EmployeeID','Email','Phone','Address'];

    };
    fetchSomeDataFromServer(tableName, columnList, searchKey, searchValue);
    clearDataTable(elementToClear);
  });

document.getElementById('classScheduleButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchClassSchedule(userID);
    clearDataTable(elementToClear);
  });

document.getElementById('classRosterButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchClassCode(userID);

  });

document.getElementById('facultyDirectoryButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    tableName = 'Employee_Data';
    if (userRole === 'Teacher') {
      columnList = ['FirstName','LastName','Email','Phone','Subject'];
    } else if (userRole === 'Admin') {
      columnList = '*';
      buttonData = {'name':'View Roster', 'searchValue': 'EmployeeID', 'functionName':'fetchClassCode'}
    } else if (userRole === 'Student') {
      columnList = ['FirstName', 'LastName','Email','Subject'];
    }
    fetchAllDataFromServer(tableName, columnList, buttonData);
    clearDataTable(elementToClear);
  });

document.getElementById('studentDirectoryButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    tableName = 'Student_Data';
    if (userRole === 'Teacher') {
      columnList = ['FirstName','LastName','Email','Phone','Address'];
    } else if (userRole === 'Admin') {
      columnList = ['FirstName','LastName','StudentID','Email','Phone','Address'];
      buttonData = {'name':'View Schedule', 'searchValue': 'StudentID', 'functionName':'fetchClassSchedule'};
    } else if (userRole === 'Student') {
      columnList = ['FirstName','LastName','Email','Phone']
    }
    fetchAllDataFromServer(tableName, columnList, buttonData);
    clearDataTable(elementToClear);
  });

document.getElementById('logoutButton').addEventListener('click', async() => {
    // Call the fetchDataFromServer function when the button is clicked
    try {
      const response = await fetch('/logout', { method: 'GET' });
      if (response.ok) {
        window.location.href = '/login.html'; // Redirect to login page after successful logout
      } else {
        console.error('Failed to logout');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } 
  });

function displayData(data) {
    const dataList = document.getElementById('dbList');

    // Clear existing content
    dataList.innerHTML = '';

    // Append fetched data to the list
    // data.forEach(employee => {
    //     const listItem = document.createElement('li');
    //     listItem.textContent = `${employee.FirstName} ${employee.LastName} - ${employee.EmployeeID} - ${employee.Address}`;
    //     dataList.appendChild(listItem);
    // });
    data.forEach(item => {
        const li = document.createElement('li');
        li.textContent = JSON.stringify(item); // Adjust as per your data structure
        dataList.appendChild(li);
    });

}

function clearDataTable(elementID) {
  const elementToClear = document.getElementById(elementID);
  elementToClear.innerHTML = '';
}
// mysantaquesa.js

async function fetchClassSchedule(user) {
  // Get ClassCode data for user
  console.log(`Fetching Class Schedule`);
  const studentID = user;
  let returnData = 'No Class Codes Yet';
  let classCode = 'None';
  let studentList = 'None';
  let currentStudent = 'None';
  let curStudGrade = 'None'; 

  try{
     // Fetch data for the specified table
     const ColNames = 'Class, Teacher, Grade';
     const ColNamesArray = ['Class','Teacher','Grade'];
     const studentDataResponse = await fetch(`/api/gradeList?userID=${studentID}`);
     const studentData = await studentDataResponse.json();
     console.log('Classes and Grades: ', studentData);
     const classesAndGrades = studentData.ClassesAndGrades.replace(/'/g, '"');
     const classesandGradesObject = JSON.parse(classesAndGrades);
     console.log('C&G Object: ', classesandGradesObject);
     let gradesArray = [];
     for(const key in classesandGradesObject) {
      console.log('key = ',key);
      const subjectDataResponse = await fetch(`/api/subjectFromClassCode?classCode=${key}`)
      const subjectData = await subjectDataResponse.json();
      console.log('subjectData = ',subjectData);
      subjectObject = { 'Class': subjectData.Subject, 'Teacher': subjectData.LastName, 'Grade': classesandGradesObject[key]};
      gradesArray.push(subjectObject);
     }
     buildTable(ColNamesArray, gradesArray, 'dbList');
    //  studentData.forEach((student) => {
    //        });
    //  buildTable(stuDataColsArray, studentData, "dbList");
    
  } catch (error) {
    console.error('Error fetching class schedule data:', error.message);
  };
}




async function fetchClassCode(user) {
  // Get ClassCode data for user
  console.log(`Fetching Class Code`);
  let returnData = 'No Class Code Yet';
  let classCode = 'None';
  let studentList = 'None';
  let currentStudent = 'None';
  let curStudGrade = 'None';
  try {
    // Fetch column names for the specified table
    let columnsJSON = ['LastName','ClassCode','Subject'];


    // Fetch data for the specified user
    const dataResponse = await fetch(`/api/classCode?userID=${user}`);
    const dataJSON = await dataResponse.json();
    console.log('Class code: ', dataJSON);
    // Build 1st table for class
    buildTable(columnsJSON, dataJSON, elementID);

    // Fetch data for the specified class
    console.log('ClassCode = ',dataJSON['ClassCode']);
    classCode = dataJSON['ClassCode'];
    console.log('ClassCode = ',classCode);
  } catch (error) {
    console.error('Error fetching class code data:', error.message);
  };
  // Fetch list of all students in that class.
  console.log(`Fetching data from Class Roster`);
  try {
    // Fetch data for the specified table
    const rosterResponse = await fetch(`/api/classRoster?classCode=${classCode}`);
    const rosterJSON = await rosterResponse.json();
    console.log('Class Roster: ', rosterJSON);
    studentList = rosterJSON['Students'];
    console.log('studentList = ',studentList, Array.isArray(studentList));
    studentList = studentList.replace(/'/g, '"');
    const studentListJSON = JSON.parse(studentList);
    console.log('studentListJSON = ',studentListJSON, Array.isArray(studentListJSON));
    studentList = studentListJSON


  } catch (error) {
    console.error('Error fetching class roster data:', error.message);
  }

  // Fetch Names and Grades of all students in that class:
  console.log('Fetching grades of all students in class');
  try {
    // const tableName = 'Student_Data';
    // Fetch data for the specified table
    const stuDataCols = 'FirstName, LastName, StudentID, ClassesAndGrades';
    const stuDataColsArray = ['FirstName','LastName', 'StudentID', 'Current Grade'];
    const args = "table='Student_Data'&columnList=${studentDataCols}&searchKey='StudentID'&searchValues=${studentList}"
    const studentDataResponse = await fetch(`/api/dataRows?table=Student_Data&columnList=${stuDataCols}&searchKey=StudentID&searchValues=${studentList}`);
    const studentData = await studentDataResponse.json();
    console.log('StudentData: ', studentData);
    studentData.forEach((student) => {
      console.log('ClassesAndGrades: ', student.ClassesAndGrades);
      const classesAndGrades = student.ClassesAndGrades.replace(/'/g, '"');
      const classesandGradesObject = JSON.parse(classesAndGrades);
      curStudGrade = classesandGradesObject[classCode];
      
      student['Current Grade'] = curStudGrade;
      console.log('current student data: ', student);
    });
    buildTable(stuDataColsArray, studentData, "dbList_part2");

  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
  // return { columns: columnsJSON, data: dataJSON}; 

};

async function fetchClassRoster(classCode) {
  console.log(`Fetching data from Class Roster`);
  try {
    // Fetch column names for the specified table
    columnsJSON = ['Student Name','Current Grade'];


    // Fetch data for the specified table
    const rosterResponse = await fetch(`/api/classRoster?classCode=${classCode}`);
    const rosterJSON = await rosterResponse.json();
    console.log('Class Roster: ', rosterJSON);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
  return { columns: columnsJSON, data: dataJSON};
};


async function fetchDataFromServer(tableName) {
  console.log(`Fetching data from table: ${tableName}`);
  try {
    // Fetch column names for the specified table
    const columnResponse = await fetch(`/api/columns?table=${tableName}`);
    const columnsJSON = await columnResponse.json();

    // Fetch data for the specified table
    const dataResponse = await fetch(`/api/data?table=${tableName}&columnList=${allColumns}`);
    const dataJSON = await dataResponse.json();
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
  return { columns: columnsJSON, data: dataJSON};
};

function buildTable(columns, data, tableElement, buttonInfo = 'None') {
  console.log(`Building a Table with Data`);
  console.log('Button Info = ',buttonInfo);
  try {
    const dataContainer = document.getElementById(tableElement);

    // Clear previous data
    dataContainer.innerHTML = '';

    // Create a table element
    const table = document.createElement('table');
    table.setAttribute('id', 'Data-Base-Table');

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Iterate through column names and create table headers
    columns.forEach((column) => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });
    if (buttonInfo !== 'None'){
      console.log('Creating header: ', buttonInfo.name)
      const th = document.createElement('th');
      th.textContent = buttonInfo.name;
      headerRow.appendChild(th);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    if (!Array.isArray(data)){
      data = [data];
    }

    // Iterate through data and create table rows

    console.log('This is an Array');
    data.forEach((item) => {
      const row = document.createElement('tr');

      // Iterate through column names and create table cells
      columns.forEach((column) => {
        const td = document.createElement('td');
        if (column === 'Email' && item[column].includes('@')) {
          const parts = item[column].split('@');
          td.innerHTML = `${parts[0]}<br>@${parts[1]}`;
        } else {
            td.textContent = item[column];
        }
        row.appendChild(td);
        // td.textContent = item[column];
        // row.appendChild(td);
      });
      if (buttonInfo !== 'None' && (item['PermissionType']=='Teacher' || buttonInfo.name == 'View Schedule')) {
        console.log('Creating button: ',buttonInfo.name);
        // Create a new cell for the "View" button
        const viewCell = document.createElement('td');
        // Create a button element
        const viewButton = document.createElement('button');
        // Set the button's text content to "View"
        viewButton.textContent = buttonInfo.name;
        // Add an event listener to the button
        viewButton.addEventListener('click', () => {
            // Call a function and pass the EmployeeID as an argument
            clearDataTable(elementToClear);
            window[buttonInfo.functionName](item[buttonInfo.searchValue]);
        });
        // Append the button to the cell
        viewCell.appendChild(viewButton);
        // Append the cell to the row
        row.appendChild(viewCell);
      }

      tbody.appendChild(row);
    });
    // Do something if value is an array

    table.appendChild(tbody);

    // Append the table to the container
    dataContainer.appendChild(table);
    adjustTableFontSize('Data-Base-Table');
  } catch (error) {
    console.error('Error building table:', error.message);
  };
};

async function fetchAllDataFromServer(tableName, columnList, buttonInfo = 'None') {
  console.log(`Fetching ALL data from table: ${tableName}`);
  console.log('Button Info = ',buttonInfo);
  let columnListText = '*';
  try {
    if (!columnList === '*'){
      columnListText = columnList.join(', ');
    } 
    console.log('columnListText = ',columnListText);
    // Fetch column names for the specified table
    const columnResponse = await fetch(`/api/columns?table=${tableName}&columnList=${columnList}`);
    const columns = await columnResponse.json();
    console.log('columns = ',columns);

    // Fetch data for the specified table

    const dataResponse = await fetch(`/api/data?table=${tableName}&columnList=${columnListText}`);
    const data = await dataResponse.json();
    console.log('data received: ',data);
    if (columnList === '*'){
      columnList = columns; 
    }
    buildTable(columnList, data, 'dbList', buttonInfo);
  } catch (error) {
    console.error('Error fetching ALL data:', error.message);
  }
}

async function fetchSomeDataFromServer(tableName, columnList, searchKey, searchValue) {
  console.log(`Fetching some data from table: ${tableName}`);
  try {
    const columnListText = columnList.join(', ');
    console.log('columnListText = ',columnListText);
    // Fetch column names for the specified table
    const columnResponse = await fetch(`/api/columns?table=${tableName}&columnList=${columnList}`);
    const columns = await columnResponse.json();
    console.log('columns = ',columns);

    // Fetch data for the specified table

    const dataResponse = await fetch(`/api/dataRow?table=${tableName}&columnList=${columnListText}&searchKey=${searchKey}&searchValue=${searchValue}`);
    const data = await dataResponse.json();
    console.log('data received: ',data);
    buildTable(columnList, data, 'dbList');

  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}
  

// Function to show or hide buttons based on the user's role
function updateButtonVisibility(role) {
  console.log('updating buttons for ',role)
  // Get references to buttons or elements you want to show or hide
  const personalInfoButton = document.getElementById('personalInfoButton');
  const classRosterButton = document.getElementById('classRosterButton');
  const classScheduleButton = document.getElementById('classScheduleButton');
  const studentDirectoryButton = document.getElementById('studentDirectoryButton');
  const facultyDirectoryButton = document.getElementById('facultyDirectoryButton');
  
  // Check the user's role and show or hide buttons accordingly
  if (role === 'Teacher') {
    personalInfoButton.style.display = 'inline-block'; // Show the button
    classRosterButton.style.display = 'inline-block'; // Show the button
    facultyDirectoryButton.style.display = 'inline-block'; // Show the button
    classScheduleButton.style.display = 'none'; // Hide the button
    studentDirectoryButton.style.display = 'none'; // Hide the button
  } else if (role === 'Student') {
    personalInfoButton.style.display = 'inline-block'; // Hide the button
    classRosterButton.style.display = 'none'; // Show the button
    classScheduleButton.style.display = 'inline-block'; // Show the button
    facultyDirectoryButton.style.display = 'inline-block'; // Hide the button
    studentDirectoryButton.style.display = 'inline-block'; // Hide the button
  } else if (role === 'Admin') {
    personalInfoButton.style.display = 'inline-block'; // Hide the button
    classRosterButton.style.display = 'none'; // Show the button
    classScheduleButton.style.display = 'none'; // Show the button
    facultyDirectoryButton.style.display = 'inline-block'; // Hide the button
    studentDirectoryButton.style.display = 'inline-block'; // Hide the button
  }
}

function adjustTableFontSize(tableId) {
  const table = document.getElementById(tableId);
  const screenWidth = window.innerWidth;
  const desiredWidth = screenWidth * 0.9; // Adjust as needed
  const currentWidth = table.offsetWidth;
  // if (currentWidth > desiredWidth) {
  // Assuming all rows have the same number of cells
  const numColumns = table.rows[0].cells.length;

  // Calculate font size based on desired width and number of columns
  const fontSize = Math.min(25, Math.max(10, Math.floor(desiredWidth / numColumns / 10))) ; // Adjust the divisor as needed

  // Set font size for all cells in the table
  const cells = table.querySelectorAll('td, th');
  cells.forEach(cell => {
      cell.style.fontSize = `${fontSize}px`;
  });
  // };

};

// Call the function when the window is resized
window.addEventListener('resize', () => {
  adjustTableFontSize('Data-Base-Table');
});

// Call the function initially to set the font size
// adjustTableFontSize('your-table-id');


// Call the function to update button visibility when the page loads or after login


window.addEventListener('load', () => {
  // Fetch user's role from the server
  fetch('/session')
      .then(response => response.json())
      .then(data => {
          // Extract user's role from the response
          userRole = data.role;
          userID = data.userID;
          console.log('User role:', userRole);
          console.log('UserID:', userID);
          updateButtonVisibility(userRole);
          // Use userRole as needed in your client-side code
          // For example, show or hide certain elements based on the role
      })
      .catch(error => {
          console.error('Error fetching user role:', error);
      });
  
});

