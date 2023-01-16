import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "web"
        // host: 'us-cdbr-east-06.cleardb.net',
        // port: 3306,
        // user: 'b7d13ee145f563',
        // password: '0c721dc9',
        // database: 'heroku_785ac602058ef49'
});
console.log("Database connected!!!");


export default pool;