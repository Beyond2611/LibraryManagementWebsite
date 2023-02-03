import express from "express";
import initWebRoute from "./route/web";
import libraryController from './controller/libraryController';
import bookController from './controller/bookController';
import path from "path";
const flash = require('connect-flash')
const multer = require('multer')
const sharpMulter = require('sharp-multer');
var session = require("express-session");
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs')
var bodyParser = require('body-parser')
require('dotenv').config();
const storage = sharpMulter({
    destination: function(req, file, cb) {
        cb(null, __dirname + '/public/images/');
    },
    imageOptions: {
        fileFormat: "jpg",
        quality: 80,
        resize: { width: 600, height: 800 },
    }
});

const upload = multer({ storage });

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(express.static('./src/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

fs.readdir('./src/views', { withFileTypes: true }, (error, files) => {
    if (error) throw error;
    const directories = files
        .filter((item) => item.isDirectory())
        .map((item) => __dirname + "/views/" + item.name);
    app.set("views", directories);
});
app.use(session({
    secret: 'keyboard-cat',
    resave: 'true',
    saveUninitialized: 'false',
    //cookie: { secure: true, maxAge: 60000 },
}));
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});
app.use(flash());
app.use(bodyParser.urlencoded({ extended: false }));

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        err.status = 401;
        return next(err);
    }
}

app.post('/edit-book/:_id', upload.single('book-img'), bookController.Edit);

app.post('/add-book', upload.single('image'), libraryController.AddBook);
initWebRoute(app);

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Node server running @ http://localhost:${port}`);
});