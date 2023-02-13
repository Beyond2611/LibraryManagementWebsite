import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

// Book-info
let getBookInfo = async(req, res) => {
    console.log(req.params);
    var message = req.flash('message');
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params.book_id]);
    var [Borrow] = await pool.execute('select * from borrow where book_id = ? and user_id = ?', [req.params.book_id, req.session.user_id]);
    var [Rating] = await pool.execute('select COALESCE(round(AVG(point), 1),0) as Avg from rating where book_id = ?', [req.params.book_id]);
    var Rate = Rating[0].Avg;
    console.log(Rating);
    return res.render("book.ejs", { session: req.session, BookInfo, Rate, Borrow, message });
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
    const [User] = await pool.execute('Select * from rating where user_id = ? and book_id = ?', [req.session.user_id, req.params.book_id]);
    if (User.length) await pool.execute('update rating set point = ? where user_id = ?', [req.body.rate, req.session.user_id]);
    else await pool.execute('insert into rating (user_id, book_id, point) values (?,?,?)', [req.session.user_id, req.params.book_id, req.body.rate]);
    req.flash('message', 'Rate book successfully');
    res.redirect('/book/' + req.params.book_id);
}

// Edit Book Page
let getEditBookPage = async(req, res) => {
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params._id]);
    return res.render("edit-book.ejs", { session: req.session, BookInfo });
}

let Delete = async(req, res) => {
    await pool.execute('delete from borrow where book_id = ?', [req.params._id]);
    await pool.execute('delete from rating where book_id = ?', [req.params._id]);
    await pool.execute('delete from books where book_id = ?', [req.params._id]);
    req.flash('message', 'Delete book successfully');
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
    req.flash('message', 'Edit book successfully');
    res.redirect('/book/' + req.params._id);
}
let Borrow = async(req, res) => {
    await pool.execute('update books set available = 0 where book_id = ?', [req.params._id]);
    await pool.execute('insert into borrow (user_id, book_id, date, return_date) values (?, ?, current_date(), date_add(current_date(), INTERVAL 7 DAY))', [req.session.user_id, req.params._id]);
    req.flash('message', 'Borrow book successfully');
    res.redirect('/book/' + req.params._id);
}
let Return = async(req, res) => {
    await pool.execute('update books set available = 1 where book_id = ?', [req.params._id]);
    await pool.execute('delete from borrow where book_id = ?', [req.params._id]);
    req.flash('message', 'Return book successfully');
    res.redirect('/book/' + req.params._id);
}
module.exports = {
    getBookInfo,
    Rate,
    getEditBookPage,
    Delete,
    Borrow,
    Return,
    Edit
}