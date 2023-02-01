import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

/********* Login Form **********/
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

/********* Login Form **********/



/********* Home Page  ***********/
let getHomePage = async(req, res, next) => {
    return res.render('home.ejs', { sessionID: req.session.user_id });
}
let Logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

/********* Home Page  ***********/

/********* Library Page **********/


// Library Page
let getLibraryPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books');
    let Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(Books[i].book_title[0].toUpperCase());
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    return res.render('library.ejs', { session: req.session });
}

let getSearchedLibraryPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books');
    req.session.Bookdata = Books;
    return res.render('library.ejs', { session: req.session });
}
let SearchInLibrary = async(req, res) => {
    console.log(req.body);
    res.redirect("/library/" + req.body.search);
}

// Add Book Page
let getAddBookPage = async(req, res) => {
    var message = req.flash('message');
    return res.render('add-book.ejs', { session: req.session, message });
}
let AddBook = async(req, res) => {
    console.log("submiting...");
    var imgsrc;
    if (!req.file) {
        console.log("No file");
        return;
    } else {
        console.log(req.file.filename);
        imgsrc = "/images/" + req.file.filename;
    }
    await pool.execute('insert into books(book_title, book_desc, author, publisher, cover) values(?,?,?,?,?)', [req.body.book_title, req.body.book_desc, req.body.author, req.body.publisher, imgsrc], (err, success) => {
        if (err) {
            throw (err);
        } else {
            console.log("file uploaded");
        }
    });
    req.flash('message', 'Book added');
    res.redirect('/add-book');
}

// Profile Page
let getProfile = async(req, res) => {
    return res.render('profile.ejs', { session: req.session });
}

// My collection Page 
let getMyCollectionPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books b join borrow br on b.book_id = br.book_id where br.user_id = ? order by b.book_title', [req.session.user_id]);
    let Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(Books[i].book_title[0].toUpperCase());
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    return res.render("my-collection.ejs", { session: req.session });
}

let SearchInMyCollection = async(req, res) => {
    console.log(req.body);
    res.redirect("/my-collection/" + req.body.search);
}
let getSearchedMyCollectionPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books b join borrow br on b.book_id = br.book_id where br.user_id = ? order by b.book_title', [req.session.user_id]);
    req.session.Bookdata = Books;
    return res.render('my-collection.ejs', { session: req.session });
}

// Book-info
let getBookInfo = async(req, res) => {
    console.log(req.params);
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params.book_id]);
    var [Rating] = await pool.execute('select round(avg(point), 1) as Avg from rating where book_id = ?', [req.params.book_id]);
    var Rate = Rating[0].Avg;
    console.log(Rating);
    return res.render("book.ejs", { session: req.session, BookInfo, Rate });
}

let Rate = async(req, res) => {
    console.log(req.body);
    /*req.session.user_id -> user_ID
    req.params.book_id -> book_id
    req.body.rate -> rating*/
    console.log(req.session.user_id);
    console.log(req.params.book_id);
    console.log(req.body.rate);
    const [User] = await pool.execute('Select * from rating where user_id = ?', [req.session.user_id]);
    if (User.length) await pool.execute('update rating set point = ? where user_id = ?', [req.body.rate, req.session.user_id]);
    else await pool.execute('insert into rating (user_id, book_id, point) values (?,?,?)', [req.session.user_id, req.params.book_id, req.body.rate]);
    res.redirect('/book/' + req.params.book_id);
}

// Setting Page
let getSettingPage = async(req, res) => {
    return res.render("setting.ejs", { session: req.session });
}

// Support Page
let getSupportPage = async(req, res) => {
    return res.render("support.ejs", { session: req.session });
}

// Edit Book Page
let getEditBookPage = async(req, res) => {
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params._id]);
    return res.render("edit-book.ejs", { session: req.session, BookInfo });
}

let Delete = async(req, res) => {
    await pool.execute('delete from books where book_id = ?', [req.params._id]);
    res.redirect('/library');
}

let Edit = async(req, res) => {
    console.log("submitting...");
    var img;
    console.log(req.file.filename);
    img = "/images/" + req.file.filename;
    console.log(req.body);
    console.log(img);
    console.log(req.params);
    await pool.execute('update books set book_title = ?, book_desc = ?, author = ?, publisher = ?, cover = ? where book_id = ? ', [req.body.book_title, req.body.book_desc, req.body.author, req.body.publisher, img, req.params._id]);
    res.redirect('/book/' + req.params._id);
}


// Book-Ranking Page
let getBookRankingPage = async(req, res) => {
    return res.render("book-ranking.ejs", { session: req.session });
}

/********* Library Page **********/


// Export Modules 

module.exports = {
    /* Login Form */
    getLoginPage,
    getSignUpPage,
    getChangePasswordPage,
    LoginAuth,
    SignUpAuth,
    ChangePasswordAuth,
    /* Home Page */
    getHomePage,
    Logout,
    getLibraryPage,
    /* Library Page */
    getAddBookPage,
    getProfile,
    AddBook,
    getSearchedLibraryPage,
    SearchInLibrary,
    SearchInMyCollection,
    getBookInfo,
    getSettingPage,
    getSupportPage,
    getEditBookPage,
    getMyCollectionPage,
    getBookRankingPage,
    getSearchedMyCollectionPage,
    Delete,
    Edit,
    Rate
    // getMyCollectionPage
}