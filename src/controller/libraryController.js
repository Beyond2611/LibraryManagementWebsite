import pool from '../configs/connectDB';
const { check, validationResult } = require('express-validator');
const books = require('../public/js/book');

function RemoveBookFromCart(Books, id) {
    console.log(1);
    console.log(Books);
    pool.execute('delete from cart where user_id = ? and book_id = ?', [Books[id].user_id, Books[id].book_id]);
    Books.splice(id, 1);
    console.log(Books);
    window.location.replace("/library");
}

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
// Library Page
let getLibraryPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books');
    var [Request] = await pool.execute('select * from request');
    var message = req.flash('message');
    let Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(convert(Books[i].book_title[0]).toUpperCase());
    }
    var [cart] = await pool.execute('select user_id, cart.book_id, books.book_title, books.author, books.cover from cart join books on cart.book_id = books.book_id where user_id = ? and pending = 0', [req.session.user_id]);
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
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
    req.session.request = Request;
    req.session.Bookdata = Books;
    req.session.total = Books.length;
    req.session.BookLetters = Booklist;
    req.session.cart = cart;
    req.session.page = "library";
    return res.render('library.ejs', { session: req.session, message, convert });
}

let getSearchedLibraryPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books');
    req.session.Bookdata = Books;
    return res.render('library.ejs', { session: req.session, convert });
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
        Booklist.add(convert(Books[i].book_title[0]).toUpperCase());
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    var [cart] = await pool.execute('select user_id, cart.book_id, books.book_title, books.author, books.cover from cart join books on cart.book_id = books.book_id where user_id = ? and pending = 0', [req.session.user_id]);
    var [overdueBook] = await pool.execute('select b.book_id, b.book_title , b.author , b.cover, (abs(datediff(curdate(), br.return_date))) as OverDate from borrow as br join books as b on br.book_id = b.book_id where datediff(curdate(), br.return_date) > 0 and br.user_id = ? order by b.book_title', [req.session.user_id]);
    var [dueBook] = await pool.execute('select b.book_id, b.book_title , b.author , b.cover, datediff(br.return_date, curdate()) as RemainingDays from borrow as br join books as b on br.book_id = b.book_id where datediff(br.return_date, curdate()) >= 0 and br.user_id = ? order by RemainingDays , b.book_title ', [req.session.user_id]);
    var [Request] = await pool.execute('select * from request');
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
    req.session.request = Request;
    req.session.dueBook = dueBook;
    req.session.cart = cart;
    req.session.overdueBook = overdueBook;
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    req.session.page = "my-collection";
    return res.render("my-collection.ejs", { session: req.session, convert });
}

let SearchInMyCollection = async(req, res) => {
    console.log(req.body);
    res.redirect("/my-collection/" + req.body.search);
}
let getSearchedMyCollectionPage = async(req, res) => {
    var [Books] = await pool.execute('select * from books b join borrow br on b.book_id = br.book_id where br.user_id = ? order by b.book_title', [req.session.user_id]);
    req.session.Bookdata = Books;
    return res.render('my-collection.ejs', { session: req.session, convert });
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

// Leaderboard Page
let getLeaderBoardPage = async(req, res) => {
    req.session.page = "Leaderboard";
    var [bookInfo] = await pool.execute('Select b.book_id , b.book_title , b.author , b.cover , COALESCE(ROUND(AVG(r.point),1),0) as point from books b left join rating r on b.book_id = r.book_id group by b.book_id order by AVG(r.point) DESC , b.book_title');
    req.session.bookInfo = bookInfo;
    return res.render("leaderboard.ejs", { session: req.session });
}
let changeTheme = async(req, res) => {
    req.session.theme = req.body.theme;
    req.flash('message', 'Change theme successfully');
    res.redirect('/setting');
}
let changeEmail = async(req, res) => {
    await pool.execute('update user set email= ? where user_id = ?', [req.body.email, req.session.user_id]);
    req.flash('message', 'Change email successfully');
    res.redirect('/profile/' + req.session.user_id);
}
let Logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

let RemoveFromCart = async(req, res) => {
    pool.execute('delete from cart where user_id = ? and book_id = ?', [req.session.cart[req.params._id].user_id, req.session.cart[req.params._id].book_id]);
    req.session.cart.splice(req.params._id, 1);
    res.redirect("/library");
}

/* Request Handling */
let getRequestsPage = async(req, res) => {
    req.session.page = "Requests";
    var [Requests] = await pool.execute('select * from request');
    return res.render("requests.ejs", { session: req.session, Requests });
}

let SendRequest = async(req, res) => {
    if (req.session.cart.length == 0) return res.redirect('/' + req.session.page);
    var StringifyObj = JSON.stringify(req.session.cart);
    console.log(StringifyObj);
    /*var ok = JSON.parse(StringifyObj);
    console.log(ok);*/
    var request_id = Math.random().toString(36).slice(2, 8);
    await pool.execute('insert into request (request_id, user_id, request_desc) values(?,?,?)', [request_id, req.session.user_id, StringifyObj]);
    await pool.execute('update cart set pending = 1 where user_id = ?', [req.session.user_id]);
    await pool.execute('insert into log(user_id , query , day) values(?,3,now())', [req.session.user_id]);
    req.session.cart = [];
    res.redirect('/' + req.session.page);
}

let AcceptRequest = async(req, res) => {
    var [request] = await pool.execute('select * from request where request_id = ?', [req.params._id]);
    var Books = JSON.parse(request[0].request_desc);
    await pool.execute('insert into log(user_id , query , day) values(?,4,now())', [req.session.user_id]);
    for (var item = 0; item < Books.length; item++) {
        await pool.execute('delete from cart where user_id = ? and book_id = ?', [request[0].user_id, Books[item].book_id]);
        await pool.execute('update books set available = 0 where book_id = ?', [Books[item].book_id]);
        await pool.execute('insert into borrow (user_id, book_id, borrow_date, return_date) values (?, ?, current_date(), date_add(current_date(), INTERVAL 7 DAY))', [request[0].user_id, Books[item].book_id]);
        await pool.execute('insert into log (user_id, book_id, query, day) values (?,?, 1, now())', [request[0].user_id, Books[item].book_id]);
    }
    await pool.execute('delete from request where request_id = ?', [req.params._id]);
    res.redirect('/requests');
}

let DeclineRequest = async(req, res) => {
    var [request] = await pool.execute('select * from request where request_id = ?', [req.params._id]);
    var Books = JSON.parse(request[0].request_desc);
    await pool.execute('insert into log(user_id , query , day) values(?,5,now())', [req.session.user_id]);
    for (var item = 0; item < Books.length; item++) {
        await pool.execute('update cart set pending = 0 where user_id = ? and book_id = ?', [request[0].user_id, Books[item].book_id]);
    }
    await pool.execute('delete from request where request_id = ?', [req.params._id]);
    res.redirect('/requests');
}

/* Return Book Handling */
let getReturnBooksPage = async(req, res) => {
    req.session.page = "Return Books";
    var message = req.flash('message');
    var [Borrow] = await pool.execute('select br.user_id , b.book_id , b.book_title , b.author , b.cover , datediff(br.return_date , current_date()) as DaysLeft from borrow br join books b on br.book_id = b.book_id ')
    var BookList = new Map();
    for (var i = 0; i < Borrow.length; i++) {
        BookList.set(Borrow[i].user_id, []);
    }
    for (var i = 0; i < Borrow.length; i++) {
        BookList.set(Borrow[i].user_id, [...BookList.get(Borrow[i].user_id), { book_id: Borrow[i].book_id, book_title: Borrow[i].book_title, book_author: Borrow[i].author, book_cover: Borrow[i].cover, day_left: Borrow[i].DaysLeft }]);
    }
    console.log(BookList);
    return res.render("return.ejs", { session: req.session, BookList, message });
}

let ReturnBooks = async(req, res) => {
    if (!req.body.books) return res.redirect('/return');
    var Book = req.body.books;
    for (var i = 0; i < Book.length; i++) {
        await pool.execute('update books set available = 1 where book_id = ?', [Book[i]]);
        await pool.execute('delete from borrow where book_id = ?', [Book[i]]);
        await pool.execute('insert into log (user_id, book_id, query, day) values (?,?, 2, now())', [req.session.user_id, Book[i]]);
    }
    req.flash('message', 'Return book successfully');
    res.redirect('/return');
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
    getRequestsPage,
    getReturnBooksPage,
    changeTheme,
    changeEmail,
    Logout,
    convert,
    RemoveFromCart,
    SendRequest,
    AcceptRequest,
    DeclineRequest,
    ReturnBooks,
}