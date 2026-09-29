require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost:27017/employee_service_portal";
const ADMIN_USER = {
  name: process.env.DEMO_ADMIN_NAME || "Admin User",
  email: process.env.DEMO_ADMIN_EMAIL,
  password: process.env.DEMO_ADMIN_PASSWORD,
  role: "admin",
};

async function createDemoAdmin() {
  if (!ADMIN_USER.email || !ADMIN_USER.password) {
    console.error(
      "Set DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD env vars before running this script."
    );
    process.exitCode = 1;
    return;
  }

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