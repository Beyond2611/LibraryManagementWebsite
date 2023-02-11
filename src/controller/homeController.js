import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

let getHomePage = async(req, res) => {
    req.session.theme = '';
    return res.render('home.ejs', { sessionID: req.session.user_id });
}
let Logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

module.exports = {
    getHomePage,
    Logout
}