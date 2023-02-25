import express from "express";
import libraryController from '../controller/libraryController';
import multer from "multer";
import pool from "../configs/connectDB";
import lib from "@babel/preset-env";
const { check } = require('express-validator');
import middleware from "../controller/libraryController"
let router = express.Router();

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
router.get('/library', libraryController.getLibraryPage);
router.post('/library', libraryController.SearchInLibrary);
router.get('/add-book', libraryController.getAddBookPage);
router.get('/profile/:user_id', libraryController.getProfile);
router.get("/library/:key", async(req, res) => {
    var key = req.params.key;
    if (key == '') res.redirect('/library');
    console.log(key);
    var [Request] = await pool.execute('select * from request');
    var [Books] = await pool.execute('select * from books where book_title like ?', ['%' + key + '%']);
    var Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(middleware.convert(Books[i].book_title[0]).toUpperCase());
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    var [cart] = await pool.execute('select user_id, cart.book_id, books.book_title, books.author, books.cover from cart join books on cart.book_id = books.book_id where user_id = ? and pending = 0', [req.session.user_id]);
    var [notification] = await pool.execute('select (case when l.query = 1 then concat("Borrow book ", b.book_title, " successfully") when l.query = 2 then concat("Return book ", b.book_title, " successfully") when l.query = 3 then "Your request is being processed. Please wait !" when l.query = 4 then "Your request is accepted" else "Your request is declined . Please reconsider !" end) as noti, l.day as date_add , EXTRACT(HOUR FROM l.day) as hour_add , EXTRACT(MINUTE FROM l.day) as minute_add , l.query as query from log l left join books b on l.book_id = b.book_id order by date_add DESC , hour_add DESC , minute_add DESC');
    var Notification = new Map();
    for (var i = 0; i < notification.length; i++) {
        var timeStamp = Date.parse(notification[i].date_add);
        //console.log(timeStamp);
        const date = new Date(timeStamp);
        notification[i].date_add = date.toLocaleDateString();
    }
    for (var i = 0; i < notification.length; i++) {
        Notification.set(notification[i].date_add, []);
    }
    for (var i = 0; i < notification.length; i++) {
        Notification.set(notification[i].date_add, [...Notification.get(notification[i].date_add), { noti: notification[i].noti, date_add: notification[i].date_add, hour_add: notification[i].hour_add, minute_add: notification[i].minute_add, query: notification[i].query }])
    }
    req.session.notification = Notification;
    req.session.notification_length = notification.length;
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    req.session.cart = cart;
    req.session.request = Request;
    var message = '';
    return res.render('library.ejs', { session: req.session, message, convert });
});
router.get('/my-collection', libraryController.getMyCollectionPage);
router.post('/my-collection', libraryController.SearchInMyCollection);
router.get("/my-collection/:key", async(req, res) => {
    var key = req.params.key;
    if (key == '') res.redirect('/my-collection');
    console.log(key);
    var [Request] = await pool.execute('select * from request');
    var [Books] = await pool.execute('select * from books b join borrow br on b.book_id = br.book_id where b.book_title like ? and br.user_id = ? ', ['%' + key + '%', req.session.user_id]);
    var Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(middleware.convert(Books[i].book_title[0]).toUpperCase());
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    var [cart] = await pool.execute('select user_id, cart.book_id, books.book_title, books.author, books.cover from cart join books on cart.book_id = books.book_id where user_id = ? and pending = 0', [req.session.user_id]);
    var [notification] = await pool.execute('select (case when l.query = 1 then concat("Borrow book ", b.book_title, " successfully") when l.query = 2 then concat("Return book ", b.book_title, " successfully") when l.query = 3 then "Your request is being processed. Please wait !" when l.query = 4 then "Your request is accepted" else "Your request is declined . Please reconsider !" end) as noti, l.day as date_add , EXTRACT(HOUR FROM l.day) as hour_add , EXTRACT(MINUTE FROM l.day) as minute_add , l.query as query from log l left join books b on l.book_id = b.book_id order by date_add DESC , hour_add DESC , minute_add DESC');
    var Notification = new Map();
    for (var i = 0; i < notification.length; i++) {
        var timeStamp = Date.parse(notification[i].date_add);
        //console.log(timeStamp);
        const date = new Date(timeStamp);
        notification[i].date_add = date.toLocaleDateString();
    }
    for (var i = 0; i < notification.length; i++) {
        Notification.set(notification[i].date_add, []);
    }
    for (var i = 0; i < notification.length; i++) {
        Notification.set(notification[i].date_add, [...Notification.get(notification[i].date_add), { noti: notification[i].noti, date_add: notification[i].date_add, hour_add: notification[i].hour_add, minute_add: notification[i].minute_add, query: notification[i].query }])
    }
    req.session.notification = Notification;
    req.session.notification_length = notification.length;
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    req.session.cart = cart;
    req.session.request = Request;
    var message = '';
    return res.render('my-collection.ejs', { session: req.session, message, convert });
});
router.get('/requests', libraryController.getRequestsPage);
router.get('/setting', libraryController.getSettingPage);
router.get('/support', libraryController.getSupportPage);
router.get('/leaderboard', libraryController.getLeaderBoardPage);
router.post('/change-theme', libraryController.changeTheme);
router.post('/change-email', libraryController.changeEmail);
router.get('/logout', libraryController.Logout);
router.get('/cart/remove/:_id', libraryController.RemoveFromCart);
router.post('/cart/submit', libraryController.SendRequest);
router.post('/requests/update/:_id', libraryController.AcceptRequest);
router.post('/requests/delete/:_id', libraryController.DeclineRequest);
router.get('/return', libraryController.getReturnBooksPage);
router.post('/return', libraryController.ReturnBooks);
module.exports = router;