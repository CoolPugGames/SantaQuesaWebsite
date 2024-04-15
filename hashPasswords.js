const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('fast-csv');

const saltRounds = 10; // Salt rounds for bcrypt

// Read the existing CSV file
fs.createReadStream('database/user_passwords.csv')
  .pipe(csv.parse({ headers: true }))
  .on('data', async (row) => {
    // Hash the password
    const hashedPassword = await bcrypt.hash(row.Password, saltRounds);
    
    // Write the hashed password to the new CSV file
    const newRow = {
      username: row.Username,
      hashedPassword: hashedPassword,
      userID: row.EmployeeID
    };

    // Append the row to the new CSV file
    fs.appendFileSync('newHashedPasswords.csv', `${newRow.username},${newRow.hashedPassword},${newRow.userID}\n`);
  })
  .on('end', () => {
    console.log('New CSV file created with hashed passwords.');
  });
