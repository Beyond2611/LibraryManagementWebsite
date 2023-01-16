import express from "express";
import homeController from '../controller/homeController';
const { check } = require('express-validator');
let router = express.Router();

const initWebRoute = (app) => {
    /* Login Form */
    //Login 
    router.get('/login', homeController.getLoginPage);
    router.post('/login-auth', homeController.LoginAuth);
    //Sign up
    router.get('/signup', homeController.getSignUpPage);
    router.post('/signup-auth', [check('account').not().isEmpty().withMessage('Account can not be blank'),
        check('email').not().isEmpty().withMessage('Email cannot be blank').isEmail().withMessage('Not a valid email'),
        check('password').not().isEmpty().withMessage('Password cannot be blank'),
        check('rpassword').not().isEmpty().withMessage('You need to enter the password again')
    ], homeController.SignUpAuth);
    //Change password
    router.get('/change-password', homeController.getChangePasswordPage);
    router.post('/change-password-auth', homeController.ChangePasswordAuth);
    /* Home Page */
    router.get('/home', homeController.getHomePage);
    /* Main Page */
    return app.use('/', router);
}

export default initWebRoute;