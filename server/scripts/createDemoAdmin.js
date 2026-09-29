require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/employee_service_portal";
const ADMIN_USER = {
  name: "Admin User",
  email: "admin@serviceportal.com",
  password: "Admin@123",
  role: "admin",
};

async function createDemoAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);

    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);
    const user = await User.findOneAndUpdate(
      { email: ADMIN_USER.email },
      {
        ...ADMIN_USER,
        password: hashedPassword,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      }
    );

    console.log(`Demo admin is ready: ${user.email}`);
  } catch (error) {
    console.error("Failed to create demo admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createDemoAdmin();