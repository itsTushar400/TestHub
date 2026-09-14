require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ MySQL Connection Failed");
    console.log(err.message);
    return;
  }

  console.log("✅ MySQL Connected Successfully");
  console.log("📦 Database:", process.env.DB_NAME);

  connection.release();
});

module.exports = db;