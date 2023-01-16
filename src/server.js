import express from "express";
import configViewEngine from "./configs/viewEngine";
import initWebRoute from "./route/web";
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
configViewEngine(app);
initWebRoute(app);

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Node server running @ http://localhost:${port}`);
});