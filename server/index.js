// imports here for express and pg
const express = require('express');
const app = express();
const path = require('path');
const { Client } = require('pg');

// Correct the port initialization to check for process.env.PORT
const port = process.env.PORT || 3000;

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost/acme_notes_db',
});

app.use(express.json()); 

app.use(express.static(path.join(__dirname, '../dist')));

// API route
app.get('/api/notes', async (req, res) => {
    try {
        const response = await client.query('SELECT * FROM notes');
        res.json(response.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Init function
async function init() {
    try {
        await client.connect();
        console.log('Connected to the database.');

        const SQL = `
            DROP TABLE IF EXISTS notes;
            CREATE TABLE notes(
                id SERIAL PRIMARY KEY,
                txt VARCHAR(255),
                starred BOOLEAN DEFAULT FALSE
            );
            INSERT INTO notes(txt, starred) VALUES('learn express', false);
            INSERT INTO notes(txt, starred) VALUES('write SQL queries', true);
            INSERT INTO notes(txt) VALUES('create routes');
            INSERT INTO notes(txt, starred) VALUES('Hello', true);
            INSERT INTO notes(txt) VALUES('Goodbye');
        `;
        
        // Execute the SQL command
        await client.query(SQL);
        console.log('Database initialized.');

        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to the database or start the server', err);
    }
}

// Invoke the init function
init();