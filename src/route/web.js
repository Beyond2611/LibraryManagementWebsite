import express from "express";
import LoginRoute from "./login";
import HomeRoute from "./home";
import LibraryRoute from "./library";
import BookRoute from "./book";

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
    /****** Login Form ******/
    app.use("/", LoginRoute);
    /****** Home Page ******/
    app.use("/", HomeRoute);
    /****** Library Page ******/
    app.use("/", LibraryRoute);
    /****** Book Page  ******/
    app.use("/", BookRoute);

    //router.post('/add-book', upload.single('image'), homeController.AddBook);
    return app.use('/', router);

}

export default initWebRoute;