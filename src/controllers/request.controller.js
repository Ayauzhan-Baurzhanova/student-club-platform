const MembershipRequest = require("../models/MembershipRequest");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

const createRequest = async (req, res, next) => {
    try {
        const { club, message } = req.body;

        if (!club || !message) {
            res.status(400);
            throw new Error("Club and message are required");
        }

        const request = await MembershipRequest.create({
            user: req.user._id,
            club,
            message,
        });

        const user = await User.findById(req.user._id);
        const subject = `Your request to join ${club} club`;
        const text = `Hello ${user.username},\n\nYour request to join the ${club} club has been successfully submitted.\n\nWe will notify you once your application is processed.`;


        await sendEmail(user.email, subject, text);


        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
};

const getUserRequests = async (req, res, next) => {
    try {
        const requests = await MembershipRequest.find({ user: req.user._id });

        if (!requests) {
            res.status(404);
            throw new Error("No requests found");
        }

        res.json(requests);
    } catch (err) {
        next(err);
    }
};

const updateRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { club, message, status } = req.body;

        const request = await MembershipRequest.findById(id);

        if (!request) {
            res.status(404);
            throw new Error("Request not found");
        }

        // 1. Check if the current user is the owner of the request
        const isOwner = String(request.user) === String(req.user._id);
        
        // 2. Check if the current user is an Admin or Moderator
        const isAdminOrMod = ["admin", "moderator"].includes(req.user.role);

        // 3. Only allow update if user is owner or has admin/moderator role
        if (!isOwner && !isAdminOrMod) {
            res.status(403);
            throw new Error("Not authorized to update this request");
        }

        // Update fields if provided
        if (club) request.club = club;
        if (message) request.message = message;
        if (status) request.status = status;

        await request.save();
        res.json(request);
    } catch (err) {
        next(err);
    }
};

const deleteRequest = async (req, res, next) => {
    try {
        const { id } = req.params;

        const request = await MembershipRequest.findById(id);

        if (!request) {
            res.status(404);
            throw new Error("Request not found");
        }

        if (String(request.user) !== String(req.user._id)) {
            res.status(403);
            throw new Error("You can only delete your own requests");
        }

        await MembershipRequest.findByIdAndDelete(id);
        res.json({ message: "Request deleted" });
    } catch (err) {
        next(err);
    }
};


const getAllRequests = async (req, res, next) => {
    try {
        const requests = await MembershipRequest.find();

        if (!requests) {
            res.status(404);
            throw new Error("No requests found");
        }

        res.json(requests);
    } catch (err) {
        next(err);
    }
};

module.exports = { createRequest, getUserRequests, updateRequest, deleteRequest, getAllRequests };
