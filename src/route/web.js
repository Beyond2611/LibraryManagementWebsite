import express from "express";
import homeController from '../controller/homeController';
import multer from "multer";
import pool from "../configs/connectDB";
const { check } = require('express-validator');
let router = express.Router();

/*var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
var upload = multer({
    storage: storage
});*/
const initWebRoute = (app) => {
    /* Index */
    router.get('/', function(req, res) {
        console.log(req.session);
        if (req.session && !req.session.user_id) {
            res.render('home.ejs');
        } else {
            res.redirect('/home');
        }
    });
    /****** Login Form ******/
    //Login 
    router.get('/login', homeController.getLoginPage);
    router.post('/login', [
        check('account').not().trim().isEmpty().withMessage('Account can not be blank'),
        check('password').not().trim().isEmpty().withMessage('Password cannot be blank'),
    ], homeController.LoginAuth);
    //Sign up
    router.get('/signup', homeController.getSignUpPage);
    router.post('/signup', [
        check('account').not().trim().isEmpty().withMessage('Account can not be blank'),
        check('email').trim().isEmail().withMessage('Email is not valid'),
        check('password').not().trim().isEmpty().withMessage('Password cannot be blank'),
        check('rpassword').trim().custom((value, { req }) => {
            if (!value) throw new Error('You need to enter the password again')
            if (value !== req.body.password) throw new Error('Password does not match')
            return true;
        })
    ], homeController.SignUpAuth);
    //Change password
    router.get('/change-password', homeController.getChangePasswordPage);
    router.post('/change-password', [
        check('account').not().trim().isEmpty().withMessage('Account can not be blank'),
        check('email').trim().isEmail().withMessage('Email is not valid'),
        check('password').not().trim().isEmpty().withMessage('Password cannot be blank'),
        check('rpassword').trim().custom((value, { req }) => {
            if (!value) throw new Error('You need to enter the password again')
            if (value !== req.body.password) throw new Error('Password does not match')
            return true;
        })
    ], homeController.ChangePasswordAuth);

    /****** Home Page ******/
    router.get('/home', homeController.getHomePage);
    /****** Library Page ******/
    router.get('/library', homeController.getLibraryPage);
    router.get('/add-book', homeController.getAddBookPage);
    router.get('/profile/:user_id', homeController.getProfile);
    router.get("/library/:key", async(req, res) => {
        var key = req.params.key;
        if (key == '') res.redirect('/library');
        console.log(key);
        var [Books] = await pool.execute('select * from books where available = 1 and book_title like ?', ['%' + key + '%']);
        var Booklist = new Set();
        for (var i = 0; i < Books.length; i++) {
            Booklist.add(Books[i].book_title[0]);
        }
        var SortedTemp = Array.from(Booklist).sort();
        Booklist = new Set(SortedTemp);
        console.log(Booklist);
        req.session.Bookdata = Books;
        req.session.BookLetters = Booklist;
        return res.render('library.ejs', { session: req.session });
    });
    router.post('/library', homeController.SearchInLibrary);
    router.get('/book/:book_id', homeController.getBookInfo);
    router.get('/setting', homeController.getSettingPage);
    router.get('/support', homeController.getSupportPage);
    router.get('/logout', homeController.Logout);
    router.get('/edit-book/:_id', homeController.getEditBookPage);
    router.get('/delete/:_id', homeController.Delete)
    router.post('/book/:book_id', homeController.Rate);
    // router.get('/my-collection', homeController.getMyCollectionPage);
    //router.post('/add-book', upload.single('image'), homeController.AddBook);
    return app.use('/', router);

}

export default initWebRoute;