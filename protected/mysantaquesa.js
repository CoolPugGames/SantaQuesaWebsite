// mysantaquesa.js

// Assume the userRole variable contains the user's role (e.g., 'teacher', 'student', 'admin')
let userRole = 'none'; // This value should come from the server-side response
let tableName = 'none';
let searchKey = 'none';
let columnList = 'All';
let userID = '';
let elementID = 'dbList';

document.getElementById('personalInfoButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    searchValue = userID;
    if (userRole === 'Student') {
      tableName = 'Student_Data';
      searchKey = 'StudentID';
      columnList = ['FirstName','LastName','StudentID','Email','Phone','Address'];
    } else {
      tableName = 'Employee_Data';
      searchKey = 'EmployeeID';
      columnList = ['FirstName','LastName','EmployeeID','Email','Phone','Address'];

    };
    fetchDataFromServerRevised(tableName, columnList, searchKey, searchValue);
  });

document.getElementById('classScheduleButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServer('Class_Rosters');
  });

document.getElementById('classRosterButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    const classCodeData = fetchClassCode(userID);

  });

document.getElementById('facultyDirectoryButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServerAndBuildTable('Employee_Data');
  });

document.getElementById('studentDirectoryButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServerAndBuildTable('Student_Data');
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
// mysantaquesa.js
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
    let columnsJSON = ['ClassCode','Subject'];


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
    console.error('Error fetching data:', error.message);
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
    console.error('Error fetching data:', error.message);
  }

  // Fetch Names and Grades of all students in that class:
  console.log('Fetching grades of all students in class');
  try {
    // const tableName = 'Student_Data';
    // Fetch data for the specified table
    const stuDataCols = 'FirstName, LastName, StudentID, ClassesAndGrades';
    const args = "table='Student_Data'&columnList=${studentDataCols}&searchKey='StudentID'&searchValues=${studentList}"
    const studentDataResponse = await fetch(`/api/dataRows?table=Student_Data&columnList=${stuDataCols}&searchKey=StudentID&searchValues=${studentList}`);
    const studentData = await studentDataResponse.json();
    console.log('StudentData: ', studentData);

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
    const dataResponse = await fetch(`/api/data?table=${tableName}`);
    const dataJSON = await dataResponse.json();
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
  return { columns: columnsJSON, data: dataJSON};
};

function buildTable(columns, data, tableElement) {
  console.log(`Building a Table with Data`);
  try {
    const dataContainer = document.getElementById(tableElement);

    // Clear previous data
    dataContainer.innerHTML = '';

    // Create a table element
    const table = document.createElement('table');

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Iterate through column names and create table headers
    columns.forEach((column) => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });

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
        td.textContent = item[column];
        row.appendChild(td);
      });

      tbody.appendChild(row);
    });
    // Do something if value is an array

    table.appendChild(tbody);

    // Append the table to the container
    dataContainer.appendChild(table);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  };
};

async function fetchDataFromServerAndBuildTable(tableName) {
    console.log(`Fetching data from table: ${tableName}`);
    try {
      // Fetch column names for the specified table
      const columnResponse = await fetch(`/api/columns?table=${tableName}`);
      const columns = await columnResponse.json();
  
      // Fetch data for the specified table
      const dataResponse = await fetch(`/api/data?table=${tableName}`);
      const data = await dataResponse.json();
      console.log(data);
      if (Array.isArray(data)) {
        console.log('This is an Array');
        // Do something if value is an array
      } else if (typeof value === "object") {
          console.log('This is an Object');
          // Do something if value is an object (excluding arrays, which are also objects)
      } else {
          console.log('This is something else.')
          // Do something if value is neither an array nor an object
      };
  
      // Assuming you have a container with the id "data-container" to display the data
      const dataContainer = document.getElementById('dbList');
  
      // Clear previous data
      dataContainer.innerHTML = '';
  
      // Create a table element
      const table = document.createElement('table');
  
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
  
      // Iterate through column names and create table headers
      columns.forEach((column) => {
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
      });
  
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Create table body
      const tbody = document.createElement('tbody');
  
      // Iterate through data and create table rows
      data.forEach((item) => {
        const row = document.createElement('tr');
  
        // Iterate through column names and create table cells
        columns.forEach((column) => {
          const td = document.createElement('td');
          td.textContent = item[column];
          row.appendChild(td);
        });
  
        tbody.appendChild(row);
      });
  
      table.appendChild(tbody);
  
      // Append the table to the container
      dataContainer.appendChild(table);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

async function fetchDataFromServerRevised(tableName, columnList, searchKey, searchValue) {
  console.log(`Fetching data from table: ${tableName}`);
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

    // Assuming you have a container with the id "data-container" to display the data
    const dataContainer = document.getElementById('dbList');

    // Clear previous data
    dataContainer.innerHTML = '';

    // Create a table element
    const table = document.createElement('table');

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Iterate through column names and create table headers
    columns.forEach((column) => {
      if (columnList.includes(column)){
        const th = document.createElement('th');
        th.textContent = column;
        headerRow.appendChild(th);
      }
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    // Iterate through data and create table rows

    const row = document.createElement('tr');

    // Iterate through column names and create table cells
    columns.forEach((column) => {
      if (columnList.includes(column)) {
        const td = document.createElement('td');
        td.textContent = data[column];
        console.log(data[column]);
        row.appendChild(td);
      }
    });

    tbody.appendChild(row);

    table.appendChild(tbody);

    // Append the table to the container
    dataContainer.appendChild(table);
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
    classRosterButton.style.display = 'inline-block'; // Show the button
    classScheduleButton.style.display = 'inline-block'; // Show the button
    facultyDirectoryButton.style.display = 'inline-block'; // Hide the button
    studentDirectoryButton.style.display = 'inline-block'; // Hide the button
  }
}

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

