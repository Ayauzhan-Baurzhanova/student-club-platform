require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // <--- NEW: Import path module

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const requestRoutes = require("./src/routes/request.routes");
const { notFound, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

// --- Serve Frontend Files ---
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

// --- Catch-All Route ---
app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
