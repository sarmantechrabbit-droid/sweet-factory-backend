const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const experimentRoutes = require("./routes/experimentRoutes.js");
const questionRoutes = require("./routes/questionRoutes.js");
const auditRoutes = require("./routes/auditRoutes.js");
const sensoryRoutes = require("./routes/sensoryRoutes.js");




const cors = require("cors");


const app = express();

app.use(cors({
    origin: ["http://localhost:5173", "http://168.231.69.231:9000","http://localhost:5175"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/experiments", experimentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/sensory", sensoryRoutes);




// Global error handler — must be AFTER all routes
app.use((err, req, res, next) => {
    console.error("[Global Error]:", err);
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

module.exports = app;