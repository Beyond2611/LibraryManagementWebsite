import express from "express";
import loginController from '../controller/loginController';
import multer from "multer";
import pool from "../configs/connectDB";
const { check } = require('express-validator');
let router = express.Router();
//Login 
router.get('/login', loginController.getLoginPage);
router.post('/login', [
    check('account').not().trim().isEmpty().withMessage('Account can not be blank'),
    check('password').not().trim().isEmpty().withMessage('Password cannot be blank'),
], loginController.LoginAuth);
//Sign up
router.get('/signup', loginController.getSignUpPage);
router.post('/signup', [
    check('account').not().trim().isEmpty().withMessage('Account can not be blank'),
    check('email').trim().isEmail().withMessage('Email is not valid'),
    check('password').not().trim().isEmpty().withMessage('Password cannot be blank'),
    check('rpassword').trim().custom((value, { req }) => {
        if (!value) throw new Error('You need to enter the password again')
        if (value !== req.body.password) throw new Error('Password does not match')
        return true;
    })
], loginController.SignUpAuth);
//Change password
router.get('/change-password', loginController.getChangePasswordPage);
router.post('/change-password', [
    check('account').not().trim().isEmpty().withMessage('Account can not be blank'),
    check('email').trim().isEmail().withMessage('Email is not valid'),
    check('password').not().trim().isEmpty().withMessage('Password cannot be blank'),
    check('rpassword').trim().custom((value, { req }) => {
        if (!value) throw new Error('You need to enter the password again')
        if (value !== req.body.password) throw new Error('Password does not match')
        return true;
    })
], loginController.ChangePasswordAuth);

module.exports = router;