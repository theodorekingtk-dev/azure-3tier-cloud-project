const express = require("express");
const sql = require("mssql");

const app = express();
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("API is running. Go to /db to test database.");
});

app.get("/db", async (req, res) => {
  try {
    const connectionString = process.env.DB_CONNECTION;

    const pool = await sql.connect(connectionString);

    const result = await pool.request().query(`
      IF OBJECT_ID('dbo.Test', 'U') IS NULL
      BEGIN
        CREATE TABLE Test (
          Id INT IDENTITY(1,1) PRIMARY KEY,
          Name NVARCHAR(100)
        );

        INSERT INTO Test (Name)
        VALUES ('Connected successfully!');
      END;

      SELECT * FROM Test;
    `);

    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log("Server running on port " + port);
});