const express = require("express");
const router = express.Router();
const verifyToken = require("../middlesware/auth");
const {
  registerUser,
  getUsers,
  loginUser,
  getUserProfile,
  applyJob,
} = require("../controllers/userController");
const requireRole = require("../middlesware/role");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// for registrtaion
router.post("/register", registerUser);

// for get all Users
router.get("/getUsers", verifyToken, requireRole("admin"), getUsers);

// For login
router.post("/login", loginUser);

// For profile
router.get("/profile", verifyToken, getUserProfile);

// For Job form
router.post(
  "/apply_job",
  verifyToken,
  requireRole("user"),
  upload.single("resume"),
  applyJob
);

module.exports = router;
