const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModels");
const jobModel = require("../models/jobModel"); 

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body; 

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ msg: "User already exists" });
    }

    const hashpassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashpassword,
      role, 
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRETE_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      msg: "User created successfully",
      user: {
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "Internal server error" });
  }
};


// Get all applicatios
exports.getApplicantsList = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access denied. Admins only." });
    }

    const applicants = await jobModel
      .find()
      .populate({
        path: "userId",
        select: "-password",
      })
      .sort({ createdAt: -1 });

    // Convert resume buffer to base64 URL
    const applicantsWithBase64Resume = applicants.map((app) => {
      const resumeBase64 = app.resume?.data
        ? `data:${app.resume.contentType};base64,${app.resume.data.toString("base64")}`
        : null;

      return {
        ...app.toObject(),
        resume: resumeBase64,
      };
    });

    res.status(200).json(applicantsWithBase64Resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

 
// To accept the job application
exports.ToAcceptApplication = async (req, res) => {
  try {
    const updated = await jobModel
      .findByIdAndUpdate(req.params.id, { status: "accepted" }, { new: true })
      .select("status");
    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json({ message: "Application accepted", application: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};
 
// To reject the job application
exports.ToRejectApplication = async (req, res) => {
  try {
    const updated = await jobModel
      .findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true })
      .select("status");
    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json({ message: "Application accepted", application: updated });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

// User login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }

    const isMatchedPassword = await bcrypt.compare(password, user.password);
    if (!isMatchedPassword) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRETE_KEY,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      msg: "Login successful",
      user: {
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details, excluding password
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Fetch job applications by this user and populate the 'company' field
    const applications = await jobModel.find({ userId }).select("role status company location description");


    res.status(200).json({
      msg: "User profile fetched",
      user,
      applications,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
};
// Apply for a job
exports.applyJob = async (req, res) => {
  try {
    console.log("Request body:", req.body); 
    const userId = req.user.id;

    const {
      fullName,
      PhoneNo,
      email,
      description,
      role,
      jobTitle,
      company,
      location,
    } = req.body;

    // Check if all required fields are present
    if (
      !fullName ||
      !PhoneNo ||
      !email ||
      !description ||
      !role ||
      !jobTitle ||
      !company ||
      !location ||
      !req.file
    ) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const resumeBuffer = req.file.buffer;
    const resumeMimeType = req.file.mimetype;

    const newJob = new jobModel({
      userId,
      fullName,
      PhoneNo,
      email,
      description,
      role,
      jobTitle,
      company,
      location,
      resume: {
        data: resumeBuffer,
        contentType: resumeMimeType,
      },
      status: "pending",
    });

    await newJob.save();

    res.status(200).json({ msg: "Job application submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
