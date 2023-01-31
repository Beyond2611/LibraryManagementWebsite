import express from "express";
var session = require("express-session");

const configViewEngine = (app) => {
    app.use(express.static('./src/public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.set("view engine", "ejs");
    app.set("views", "./src/views");
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
}

export default configViewEngine;