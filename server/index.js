// imports here for express and pg
const express = require("express");
const app = express();
const path = require("path");
const { Client } = require("pg");
const port = process.env.PORT || 3000;
const client = new Client({
  connectionString:
    process.env.DATABASE_URL || "postgres://localhost/acme_hr_db",
});

app.use(express.json());

app.use(express.static(path.join(__dirname, "../dist")));

// API route
app.get("/api/employees", async (req, res) => {
  try {
    const response = await client.query("SELECT * FROM employees");
    res.json(response.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Init function
async function init() {
  try {
    await client.connect();
    console.log("Connected to the database.");

    const SQL = `
              DROP TABLE IF EXISTS employees;
              CREATE TABLE employees(
                  id SERIAL PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  position VARCHAR(255) NOT NULL,
                  is_admin BOOLEAN DEFAULT FALSE
              );
              INSERT INTO employees(name, position, is_admin) VALUES('Alice Smith', 'Manager', false);
              INSERT INTO employees(name, position, is_admin) VALUES('Bob Jones', 'Director', true);
              INSERT INTO employees(name, position) VALUES('Charlie Brown', 'Analyst');
          `;

    await client.query(SQL);
    console.log("Database initialized.");

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to the database or start the server", err);
  }
}

// Invoke the init function
init();
