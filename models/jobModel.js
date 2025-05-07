const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  PhoneNo: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer', 'Software Intern', 'Other'],
    required: true,
  },
  resume: {
    data: Buffer,
    contentType: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  company: { 
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
