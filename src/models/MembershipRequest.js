const mongoose = require("mongoose");

const membershipRequestSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        club: {
            type: String,
            enum: ["sports", "debate", "music"],
            required: true
        },
        message: {
            type: String,
            required: true,
            minlength: 5
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("MembershipRequest", membershipRequestSchema);
