import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    headline: {
      type: String,
      maxlength: [200, "Headline cannot be more than 200 characters"],
      default: "",
    },
    bio: {
      type: String,
      maxlength: [1000, "Bio cannot be more than 1000 characters"],
      default: "",
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot be more than 100 characters"],
      default: "",
    },
    connections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        school: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
      },
    ],
    skills: [String],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
// userSchema.index({ email: 1 });
userSchema.index({ name: "text", headline: "text" });

// Virtual for connection count
userSchema.virtual("connectionCount").get(function () {
  return this.connections?.length || 0;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

// Static method to find users by search query
userSchema.statics.search = function (query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: "i" } },
      { headline: { $regex: query, $options: "i" } },
      { skills: { $regex: query, $options: "i" } },
    ],
    isActive: true,
  });
};

export default mongoose.model("User", userSchema);
