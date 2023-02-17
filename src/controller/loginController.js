import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

var dataUser = {
    'success': '',
    'account': '',
    'email': '',
    'password': '',
    'rpassword': '',
    'error_account': '',
    'error_email': '',
    'error_password': '',
    'error_rpassword': ''
}

function Clear(object) {
    for (const property in object) object[property] = '';
}
let getLoginPage = (req, res) => {
    req.session.theme = '';
    res.render('login.ejs', dataUser)
    Clear(dataUser);
    return;
}

let getSignUpPage = (req, res) => {
    res.render('signup.ejs', dataUser);
    Clear(dataUser);
    return;
}
let getChangePasswordPage = (req, res) => {
    res.render('change-password.ejs', dataUser);
    Clear(dataUser);
    return;
}
let LoginAuth = async(req, res) => {
    let { account, password } = req.body;
    dataUser.account = account;
    dataUser.password = password;
    const errors = validationResult(req);
    errors.array().forEach(element => {
        if (element.param == 'account') dataUser.error_account = element.msg;
        else if (element.param == 'password') dataUser.error_password = element.msg;
    })
    const [findPassword] = await pool.execute('select password from user where account=?', [account]);
    if (findPassword.length == 0 && !dataUser.error_account) dataUser.error_account = 'Account does not exist';
    if (findPassword.length != 0 && findPassword[0].password !== password && !dataUser.error_password) dataUser.error_password = 'Password is not correct';
    if (errors.isEmpty() && findPassword.length != 0 && findPassword[0].password === password) {
        var [profile] = await pool.execute('select * from user where account = ?', [account]);
        var [perm] = await pool.execute('select manage_user, manage_book, manage_order from auth left join permission on auth.auth_level = permission.auth_level where user_id = ?', [profile[0].user_id]);
        await pool.execute('update user set last_login = current_timestamp() where account =?', [account]);

        req.session.user_id = profile[0].user_id;
        req.session.loggedin = true
        req.session.profile = profile;
        req.session.perm = perm;

        console.log(req.session);
        Clear(dataUser);
        //console.log(req.session);
        return res.redirect('/home');
    }
    return res.redirect('/login');
}
let SignUpAuth = async(req, res) => {
    let { account, email, password, rpassword } = req.body;
    dataUser.account = account;
    dataUser.email = email;
    dataUser.password = password;
    dataUser.rpassword = rpassword;
    const errors = validationResult(req);
    errors.array().forEach(element => {
        if (element.param == 'account') dataUser.error_account = element.msg;
        else if (element.param == 'email') dataUser.error_email = element.msg;
        else if (element.param == 'password') dataUser.error_password = element.msg;
        else dataUser.error_rpassword = element.msg;
    })
    const [findByAccount] = await pool.execute('select * from user where account = ?', [account]);
    const [findByEmail] = await pool.execute('select * from user where email = ?', [email]);
    if (findByEmail.length != 0 && !dataUser.error_email) dataUser.error_email = 'Email already existed';
    if (findByAccount.length != 0 && !dataUser.error_account) dataUser.error_account = 'Account already existed';
    if (errors.isEmpty() && findByAccount.length == 0 && findByEmail.length == 0) {
        await pool.execute('insert into user(account,email,password) values(?,?,?)', [account, email, password]);
        var [id] = await pool.execute('select user_id from user where account =?', [account]);
        await pool.execute('insert into auth(user_id) value(?)', [id[0].user_id]);
        Clear(dataUser);
        dataUser.success = 'Create new account successfully';
        return res.redirect('/login');
    }
    return res.redirect('/signup');
}
let ChangePasswordAuth = async(req, res) => {
    let { account, email, password, rpassword } = req.body;
    dataUser.account = account;
    dataUser.email = email;
    dataUser.password = password;
    dataUser.rpassword = rpassword;
    const errors = validationResult(req);
    const [findByAccount] = await pool.execute('select email from user where account = ?', [account]);
    errors.array().forEach(element => {
        if (element.param == 'account') dataUser.error_account = element.msg;
        else if (element.param == 'email') dataUser.error_email = element.msg;
        else if (element.param == 'password') dataUser.error_password = element.msg;
        else dataUser.error_rpassword = element.msg;
    })
    if (findByAccount.length == 0 && !dataUser.error_account) dataUser.error_account = 'Account does not exist';
    if (findByAccount.length != 0 && findByAccount[0].email !== email && !dataUser.error_email) dataUser.error_email = 'Email is not correct';
    if (errors.isEmpty() && findByAccount.length != 0 && findByAccount[0].email === email) {
        await pool.execute('update user set password=? where account=?', [password, account]);
        Clear(dataUser);
        dataUser.success = 'Change password successfully';
        return res.redirect('/login');
    }
    return res.redirect('/change-password')
}
module.exports = {
    getLoginPage,
    getSignUpPage,
    getChangePasswordPage,
    LoginAuth,
    SignUpAuth,
    ChangePasswordAuth
}