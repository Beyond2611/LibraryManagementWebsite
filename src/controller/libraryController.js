import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

// Library Page
let getLibraryPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books');
    var message = req.flash('message');
    let Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(Books[i].book_title[0].toUpperCase());
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    req.session.Bookdata = Books;
    req.session.total = Books.length;
    req.session.BookLetters = Booklist;
    req.session.page = "Library";
    return res.render('library.ejs', { session: req.session, message });
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
    req.session.page = "My collection";
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

// Profile Page 
let getProfile = async(req, res) => {
    var message = req.flash('message');
    req.session.page = "Profile";
    return res.render('profile.ejs', { session: req.session, message });
}

// Add Book Page
let getAddBookPage = async(req, res) => {
    var message = req.flash('message');
    req.session.page = "Add book";
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
    req.flash('message', 'Book added successfully');
    res.redirect('/add-book');
}

// Setting Page
let getSettingPage = async(req, res) => {
    req.session.page = "Setting";
    var message = req.flash('message');
    return res.render("setting.ejs", { session: req.session, message });
}

// Support Page
let getSupportPage = async(req, res) => {
    req.session.page = "Support";
    return res.render("support.ejs", { session: req.session });
}
let getLeaderBoardPage = async(req, res) => {
    req.session.page = "Leaderboard";
    var [bookInfo] = await pool.execute('Select b.book_id , b.book_title , b.author , b.cover , COALESCE(ROUND(AVG(r.point),1),0) as point from books b left join rating r on b.book_id = r.book_id group by b.book_id order by AVG(r.point) DESC , b.book_title limit ? ', [req.params.top]);
    req.session.num_book = req.params.top;
    req.session.bookInfo = bookInfo;
    return res.render("leaderboard.ejs", { session: req.session });
}
let changeTheme = async(req, res) => {
    req.session.theme = req.body.theme;
    console.log(req.session.theme);
    req.flash('message', 'Change theme successfully');
    res.redirect('/setting');
}
let changeEmail = async(req, res) => {
    await pool.execute('update user set email= ? where user_id = ?', [req.body.email, req.session.user_id])
    req.flash('message', 'Change email successfully');
    res.redirect('/profile/' + req.session.user_id);
}
let viewMore = async(req, res) => {
    req.session.num_book = Math.min(10 + req.session.num_book, req.session.total);
    return res.redirect('/leaderboard/' + req.session.num_book);
}
let Logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

module.exports = {
    getLibraryPage,
    getAddBookPage,
    getProfile,
    AddBook,
    getSearchedLibraryPage,
    SearchInLibrary,
    getMyCollectionPage,
    SearchInMyCollection,
    getSettingPage,
    getSupportPage,
    getLeaderBoardPage,
    getSearchedMyCollectionPage,
    changeTheme,
    changeEmail,
    viewMore,
    Logout
}