const mysql = require("mysql2");

const db = mysql.createConnection({
	user: "root",
	host: "localhost",
	password: process.env.DB_PASSWORD,
	database: "resume_builder",
});

module.exports = db;
