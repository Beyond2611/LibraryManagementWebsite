import mysql from "mysql2/promise";

const pool = mysql.createPool({
    //host: "localhost",
    //user: "root",
    //password: "",
    //database: "web"
         host: 'us-cdbr-east-06.cleardb.net',
         port: 3306,
          user: 'b73d61e7785062',
          password: 'c04f5ecd',
          database: 'heroku_096c6efa81c9ac3'
});
console.log("Database connected!!!");


export default pool;