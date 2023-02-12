import express from "express";
import libraryController from '../controller/libraryController';
import multer from "multer";
import pool from "../configs/connectDB";
import lib from "@babel/preset-env";
const { check } = require('express-validator');
let router = express.Router();

router.get('/library', libraryController.getLibraryPage);
router.post('/library', libraryController.SearchInLibrary);
router.get('/add-book', libraryController.getAddBookPage);
router.get('/profile/:user_id', libraryController.getProfile);
router.get("/library/:key", async(req, res) => {
    var key = req.params.key;
    if (key == '') res.redirect('/library');
    console.log(key);
    var [Books] = await pool.execute('select * from books where book_title like ?', ['%' + key + '%']);
    var Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(Books[i].book_title[0]);
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    var message = '';
    return res.render('library.ejs', { session: req.session, message });
});
router.get('/my-collection', libraryController.getMyCollectionPage);
router.post('/my-collection', libraryController.SearchInMyCollection);
router.get("/my-collection/:key", async(req, res) => {
    var key = req.params.key;
    if (key == '') res.redirect('/my-collection');
    console.log(key);
    var [Books] = await pool.execute('select * from books b join borrow br on b.book_id = br.book_id where b.book_title like ? and br.user_id = ? ', ['%' + key + '%', req.session.user_id]);
    var Booklist = new Set();
    for (var i = 0; i < Books.length; i++) {
        Booklist.add(Books[i].book_title[0]);
    }
    var SortedTemp = Array.from(Booklist).sort();
    Booklist = new Set(SortedTemp);
    console.log(Booklist);
    req.session.Bookdata = Books;
    req.session.BookLetters = Booklist;
    var message = '';
    return res.render('my-collection.ejs', { session: req.session, message });
});
router.get('/setting', libraryController.getSettingPage);
router.get('/support', libraryController.getSupportPage);
router.get('/leaderboard/:top', libraryController.getLeaderBoardPage);
router.get('/viewMore', libraryController.viewMore);
router.post('/change-theme', libraryController.changeTheme);
router.post('/change-email', libraryController.changeEmail);
router.get('/logout', libraryController.Logout);

module.exports = router;