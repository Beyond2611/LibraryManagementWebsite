import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
let getLoginPage = (req, res) => {
    return res.render('login.ejs')
}
let getSignUpPage = (req, res) => {
    return res.render('signup.ejs')
}
let getChangePasswordPage = (req, res) => {
    return res.render('change-password.ejs')
}
let getHomePage = async(req, res) => {
    const [rows, fields] = await pool.execute('Select * from user');
    console.log(rows);
    return res.render('home.ejs')
}
let LoginAuth = (req, res) => {
    return res.redirect('/home');
}
let SignUpAuth = async(req, res) => {
    let { account, email, password, rpassword } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.redirect('/login');
    }
    await pool.execute('insert into user(account,email,password) values(?,?,?)', [account, email, password]);
    return res.redirect('/login');
}
let ChangePasswordAuth = async(req, res) => {
    let { account, email, password, rpassword } = req.body;
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        await pool.execute('update user set password=? where account=?', [password, account]);
        return res.redirect('/login');
    }
}
module.exports = {
    getLoginPage,
    getSignUpPage,
    getChangePasswordPage,
    LoginAuth,
    SignUpAuth,
    ChangePasswordAuth,
    getHomePage
}