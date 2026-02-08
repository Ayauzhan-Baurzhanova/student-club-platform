const router = require("express").Router();
const { body } = require("express-validator");
const { roleMiddleware } = require("../middlewares/role.middleware");
const { changeUserRole } = require("../controllers/user.controller");

const { protect } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { getProfile, updateProfile } = require("../controllers/user.controller");

router.get("/profile", protect, getProfile);

router.put(
    "/profile",
    protect,
    [
        body("email").optional().isEmail().withMessage("Valid email is required"),
        body("username").optional().trim().notEmpty().withMessage("Username cannot be empty"),
        validate
    ],
    updateProfile
);
router.put("/role/:id", protect, roleMiddleware(["admin"]), changeUserRole);

module.exports = router;
