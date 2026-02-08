console.log("auth.routes loaded");


const router = require("express").Router();
const { body } = require("express-validator");

const { register, login } = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");

router.post(
    "/register",
    [
        body("username").trim().notEmpty().withMessage("Username is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
        validate
    ],
    register
);

router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Valid email is required"),
        body("password").notEmpty().withMessage("Password is required"),
        validate
    ],
    login
);

module.exports = router;
