
// mysantaquesa.js


document.getElementById('personalInfoButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServer('Employee_Data');
  });

document.getElementById('classScheduleButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServer('Class_Rosters');
  });

document.getElementById('classRosterButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServer('Student_Grades');
  });

document.getElementById('facultyDirectoryButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServer('Employee_Data');
  });

document.getElementById('studentDirectoryButton').addEventListener('click', function() {
    // Call the fetchDataFromServer function when the button is clicked
    fetchDataFromServer('Student_Data');
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

async function fetchDataFromServer(tableName) {
    console.log(`Fetching data from table: ${tableName}`);
    try {
      // Fetch column names for the specified table
      const columnResponse = await fetch(`/api/columns?table=${tableName}`);
      const columns = await columnResponse.json();
  
      // Fetch data for the specified table
      const dataResponse = await fetch(`/api/data?table=${tableName}`);
      const data = await dataResponse.json();
  
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
  
// Assume the userRole variable contains the user's role (e.g., 'teacher', 'student', 'admin')
let userRole = 'none'; // This value should come from the server-side response

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
          console.log('User role:', userRole);
          updateButtonVisibility(userRole);
          // Use userRole as needed in your client-side code
          // For example, show or hide certain elements based on the role
      })
      .catch(error => {
          console.error('Error fetching user role:', error);
      });
  
});

