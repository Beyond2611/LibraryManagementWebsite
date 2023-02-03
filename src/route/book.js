import express from "express";
import bookController from '../controller/bookController';
import multer from "multer";
import pool from "../configs/connectDB";
const { check } = require('express-validator');
let router = express.Router();
router.get('/book/:book_id', bookController.getBookInfo);
router.post('/book/:book_id', bookController.Rate);
router.get('/edit-book/:_id', bookController.getEditBookPage);
router.get('/delete/:_id', bookController.Delete);

module.exports = router;