import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

function convert(str) {
    str = str.replaceAll("à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ", "a");
    str = str.replaceAll("è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ", "e");
    str = str.replaceAll("ì|í|ị|ỉ|ĩ", "i");
    str = str.replaceAll("ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ", "o");
    str = str.replaceAll("ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ", "u");
    str = str.replaceAll("ỳ|ý|ỵ|ỷ|ỹ", "y");
    str = str.replaceAll("đ", "d");

    str = str.replaceAll("À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ", "A");
    str = str.replaceAll("È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ", "E");
    str = str.replaceAll("Ì|Í|Ị|Ỉ|Ĩ", "I");
    str = str.replaceAll("Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ", "O");
    str = str.replaceAll("Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ", "U");
    str = str.replaceAll("Ỳ|Ý|Ỵ|Ỷ|Ỹ", "Y");
    str = str.replaceAll("Đ", "D");
    return str;
}
// Book-info
let getBookInfo = async(req, res) => {
    console.log(req.params);
    var message = req.flash('message');
    var [BookInfo] = await pool.execute('select * from books where book_id = ?', [req.params.book_id]);
    var [Rating] = await pool.execute('select COALESCE(round(AVG(point), 1),0) as Avg from rating where book_id = ?', [req.params.book_id]);
    var Rate = Rating[0].Avg;
    var [BookAdded] = await pool.execute('select * from cart join books on cart.book_id = books.book_id where user_id = ? and cart.book_id = ?', [req.session.user_id, req.params.book_id]);
    var inCart = (BookAdded.length == 1);
    for (var item = 0; item < BookInfo.length; item++) {
        //console.log(BookInfo[item].date_add);
        var timeStamp = Date.parse(BookInfo[item].date_add);
        //console.log(timeStamp);
        const date = new Date(timeStamp);
        BookInfo[item].date_add = date.toLocaleDateString();
    }
    console.log(Rating);
    return res.render("book.ejs", { session: req.session, BookInfo, Rate, message, inCart });
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
    if (User.length) await pool.execute('update rating set point = ? where user_id = ? and book_id = ?', [req.body.rate, req.session.user_id, req.params.book_id]);
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
let addBookToCart = async(req, res) => {
    await pool.execute('insert into cart (user_id, book_id) values(?, ?)', [req.session.user_id, req.params._id]);
    console.log(1);
    var [BookAdded] = await pool.execute('select * from cart join books on cart.book_id = books.book_id where user_id = ? and cart.book_id = ?', [req.session.user_id, req.params._id]);
    req.session.cart.push(BookAdded[0]);

    req.flash('message', 'Book added to cart');
    res.redirect('/book/' + req.params._id);
}

module.exports = {
    getBookInfo,
    Rate,
    getEditBookPage,
    Delete,
    Edit,
    convert,
    addBookToCart
}