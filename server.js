console.log("RUNNING FILE:", __filename);

require("dotenv").config();


const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const requestRoutes = require("./src/routes/request.routes");

const { notFound, errorHandler } = require("./src/middlewares/error.middleware");

const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Student Club API is running"));
app.use((req, res, next) => {
    console.log("REQ:", req.method, req.url);
    next();
});

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
