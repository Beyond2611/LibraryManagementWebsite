import express from "express";
import homeController from '../controller/homeController';
import multer from "multer";
import pool from "../configs/connectDB";
const { check } = require('express-validator');
let router = express.Router();

router.get('/', function(req, res) {
    console.log(req.session);
    if (req.session && !req.session.user_id) {
        res.render('home.ejs');
    } else {
        res.redirect('/home');
    }
});
router.get('/home', homeController.getHomePage);
module.exports = router;