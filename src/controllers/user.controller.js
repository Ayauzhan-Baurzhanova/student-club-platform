const User = require("../models/User");

const getProfile = async (req, res, next) => {
    try {
        res.json(req.user);
    } catch (err) {
        next(err);
    }
};


const updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;

        if (email) {
            const taken = await User.findOne({ email, _id: { $ne: req.user._id } });
            if (taken) {
                res.status(400);
                throw new Error("Email already in use");
            }
        }

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            {
                ...(username && { username }),
                ...(email && { email })
            },
            { new: true }
        ).select("-password");

        res.json(updated);
    } catch (err) {
        next(err);
    }
};
const changeUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // Новая роль


        if (!["user", "moderator", "admin"].includes(role)) {
            res.status(400);
            throw new Error("Invalid role");
        }

        const user = await User.findById(id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }


        user.role = role;
        await user.save();

        res.json({ message: "User role updated", user });
    } catch (err) {
        next(err);
    }
};

module.exports = { getProfile, updateProfile, changeUserRole};
