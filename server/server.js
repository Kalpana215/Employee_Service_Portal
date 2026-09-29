require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

const app = express();

const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// Service request routes
app.use("/api/requests", requestRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/employee_service_portal")
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });

// Test API
app.get("/", (req, res) => {
  res.json({
    message: "Employee Service Portal API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});