const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    avatar: { type: String },
    userType: { type: String, enum: ["user", "service_provider", "admin"], default: "user" },
    
    // Service provider specific fields
    serviceDescription: { type: String },
    experience: { type: String },
    cnic: { type: String },
    serviceCategory: { type: String },
    policeVerification: { type: String }, // File path for police verification document
    
    // ✅ User Settings
  settings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    profileVisibility: { type: Boolean, default: true },
    locationSharing: { type: Boolean, default: true },
  }
  },
  { timestamps: true }
);

// Password hash middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
