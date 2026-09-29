const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const ServiceRequest = require("../models/ServiceRequest");

const router = express.Router();

router.get("/admin/counts", adminMiddleware, async (req, res) => {
  try {
    const [total, pending, inProgress, completed] = await Promise.all([
      ServiceRequest.countDocuments(),
      ServiceRequest.countDocuments({ status: "Pending" }),
      ServiceRequest.countDocuments({ status: "In Progress" }),
      ServiceRequest.countDocuments({ status: "Completed" }),
    ]);

    res.status(200).json({
      counts: { total, pending, inProgress, completed },
    });
  } catch (error) {
    console.error("Get admin request counts error:", error);

    res.status(500).json({
      message: "Failed to retrieve request counts",
    });
  }
});

router.get("/admin", adminMiddleware, async (req, res) => {
  try {
    const requests = await ServiceRequest.find()
      .populate("employee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get all requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve service requests",
    });
  }
});

router.get("/admin/:id", adminMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    const request = await ServiceRequest.findById(req.params.id).populate(
      "employee",
      "name email"
    );

    if (!request) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({ request });
  } catch (error) {
    console.error("Get request details error:", error);

    res.status(500).json({
      message: "Failed to retrieve service request",
    });
  }
});

router.patch("/:id/status", adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["Pending", "In Progress", "Completed"];

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid request ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be Pending, In Progress, or Completed",
      });
    }

    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true }
    ).populate("employee", "name email");

    if (!request) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      message: "Request status updated successfully",
      request,
    });
  } catch (error) {
    console.error("Update request status error:", error);

    res.status(500).json({
      message: "Failed to update request status",
    });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { requestType, subject, description, priority } = req.body;

    if (!requestType || !subject || !description || !priority) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newRequest = await ServiceRequest.create({
      employee: req.user.id,
      requestType,
      subject,
      description,
      priority,
      status: "Pending",
    });

    res.status(201).json({
      message: "Service request created successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Create request error:", error);

    res.status(500).json({
      message: "Failed to create service request",
    });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ employee: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);

    res.status(500).json({
      message: "Failed to retrieve service requests",
    });
  }
});

router.get("/counts", authMiddleware, async (req, res) => {
  try {
    const employeeId = req.user.id;

    const totalRequests = await ServiceRequest.countDocuments({
      employee: employeeId,
    });

    const pendingCount = await ServiceRequest.countDocuments({
      employee: employeeId,
      status: "Pending",
    });

    const inProgressCount = await ServiceRequest.countDocuments({
      employee: employeeId,
      status: "In Progress",
    });

    const completedCount = await ServiceRequest.countDocuments({
      employee: employeeId,
      status: "Completed",
    });

    res.status(200).json({
      message: "Request counts retrieved successfully",
      counts: {
        total: totalRequests,
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
      },
    });
  } catch (error) {
    console.error("Get counts error:", error);

    res.status(500).json({
      message: "Failed to retrieve request counts",
    });
  }
});

module.exports = router;
