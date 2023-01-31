import express from "express";
import configViewEngine from "./configs/viewEngine";
import initWebRoute from "./route/web";
import homeController from "./controller/homeController";
import path from "path";
const multer = require('multer')
const sharpMulter = require('sharp-multer');
require('dotenv').config();
var session = require("express-session");
const flash = require('connect-flash')

const app = express();
const port = process.env.PORT || 3000;
app.use(express.static('public'));
app.use(flash());
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    secret: 'keyboard-cat',
    resave: 'true',
    saveUninitialized: 'false',
    //cookie: { secure: true, maxAge: 60000 },
}));
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

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error('You must be logged in to view this page.');
        err.status = 401;
        return next(err);
    }
}
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.post('/edit-book/:_id', upload.single('book-img'), homeController.Edit);

app.post('/add-book', upload.single('image'), homeController.AddBook);
configViewEngine(app);
initWebRoute(app);

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Node server running @ http://localhost:${port}`);
});