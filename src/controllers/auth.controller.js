const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/register
const register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        const exists = await User.findOne({ email });
        if (exists) {
            res.status(400);
            throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        const userRole = role || "user";

        const user = await User.create({
            username,
            email,
            password: hashed,
            role: userRole
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        next(err);
    }
};

// POST /api/login
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400);
            throw new Error("Invalid credentials");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            res.status(400);
            throw new Error("Invalid credentials");
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { register, login };
