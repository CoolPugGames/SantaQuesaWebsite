const sqlite3 = require('sqlite3').verbose();
const { table } = require('console');
const path = require('path');



const dbPath = '../database/SQdata.db'
// const db = new sqlite3.Database(dbPath);

function fetchDataFromDatabase(tableName) {
    console.log(`Accessing Database ${tableName}`);
    const db = new sqlite3.Database(dbPath);
    const query = `SELECT * FROM ${tableName}`

    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            db.close();

            if (err) {
                console.error('Error executing query:', err.message);
                return res.status(500).json({ error: 'Internal server error.' });
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

module.exports = fetchDataFromDatabase;