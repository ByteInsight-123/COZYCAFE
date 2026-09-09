const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "vish@123",
    database: "cozycafe",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testDatabase() {
    try {
        const connection = await pool.getConnection();

        console.log("====================================");
        console.log("✅ MYSQL DATABASE CONNECTED");
        console.log("====================================");
        console.log("Host: 127.0.0.1");
        console.log("Port: 3307");
        console.log("Database: cozycafe");
        console.log("User: root");
        console.log("====================================");

        connection.release();

        return true;

    } catch (error) {

        console.log("====================================");
        console.log("❌ MYSQL DATABASE CONNECTION FAILED");
        console.log("====================================");
        console.log("Error Code:", error.code);
        console.log("Error Message:", error.message);
        console.log("====================================");

        return false;
    }
}

module.exports = {
    pool,
    testDatabase
};