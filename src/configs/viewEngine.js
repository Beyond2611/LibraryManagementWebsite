import express from "express";

const configViewEngine = (app) => {
    app.use(express.static('./src/public'));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.set("view engine", "ejs");
    app.set("views", "./src/views");
}

export default configViewEngine;