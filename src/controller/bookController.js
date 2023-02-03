import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

// Book-info
let getBookInfo = async(req, res) => {
    console.log(req.params);
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params.book_id]);
    var [Rating] = await pool.execute('select round(avg(point), 1) as Avg from rating where book_id = ?', [req.params.book_id]);
    var Rate = Rating[0].Avg;
    console.log(Rating);
    return res.render("book.ejs", { session: req.session, BookInfo, Rate });
}

// Rating
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

// Edit Book Page
let getEditBookPage = async(req, res) => {
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params._id]);
    req.session.page = "Edit Book";
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

module.exports = {
    getBookInfo,
    Rate,
    getEditBookPage,
    Delete,
    Edit
}