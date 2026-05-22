const express = require("express");
const sql = require("mssql");

const app = express();

app.use(express.json());
const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("API is running. Go to /db to test database.");
});

app.get("/db", async (req, res) => {
  try {
    const connectionString = process.env.DB_CONNECTION;

    const pool = await sql.connect(process.env.DB_CONNECTION);

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
app.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect(process.env.DB_CONNECTION);
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .input('ip', sql.NVarChar, req.headers['x-forwarded-for'] || req.socket.remoteAddress)
            .input('agent', sql.NVarChar, req.headers['user-agent'])
            .input('path', sql.NVarChar, req.originalUrl)
            .query(`
                INSERT INTO HoneypotLogs
                (UsernameAttempt, PasswordAttempt, SourceIP, UserAgent, RequestPath)
                VALUES
                (@username, @password, @ip, @agent, @path)
            `);

        res.status(401).send('Invalid credentials');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
