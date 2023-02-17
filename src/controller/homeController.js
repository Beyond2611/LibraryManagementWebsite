import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

let getHomePage = async(req, res) => {
    return res.render('home.ejs', { sessionID: req.session.user_id });
}
let Logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

let Expired = async(req, res) => {
    await pool.execute('select book_id, abs(datediff(curdate(), out_of_date)) from borrow where user_id = ?', [req.params._id]);
    await pool.execute('select book_id, datediff(out_of_date, curdate()) from borrow where datediff(out_of_date, curdate())  >= 0 and datediff(out_of_date, curdate()) <= 3 and > user_id = ?', [req.params._id]);
    res.redirect('/book/' + req.params._id);
}

module.exports = {
    getHomePage,
    Expired,
    Logout
}