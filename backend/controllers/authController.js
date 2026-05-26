import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
    });

    const verifyUrl = `${process.env.BASE_URL}/api/auth/verify/${verificationToken}`;

    await sendEmail(
      user.email,
      "Verify your email",
      `
      <h2>Email Verification</h2>
      <p>Copy this link and paste in browser:</p>
      <p style="word-break: break-all;">${verifyUrl}</p>
      `
    );

    res.status(201).json({
      message: "User registered. Please verify your email.",
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// LOGIN
export const loginUser = async (req, res) => {
  try {
    // 🔥 STEP 1: email normalize
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    console.log("Entered Email:", email);
    console.log("Entered Password:", password);

    // 🔥 STEP 2: find user
    const user = await User.findOne({ email });

    console.log("User found:", user);

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔥 STEP 3: password compare (IMPORTANT)
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", isMatch); // 👈 YE LINE ADD KARNI HAI

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔥 STEP 4: check verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    // 🔥 STEP 5: generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bodyType: user.bodyType,
        profileImage: user.profileImage,
        gender: user.gender,
        preferences: user.preferences,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// EMAIL VERIFY
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // user find using token
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // verify user
    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    // Redirect to frontend login page
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/login?verified=true`);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    // 1. check user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 3. hash token (security 🔥)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 4. save in DB
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    // 5. create reset URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // 6. send email
    await sendEmail(
      user.email,
      "Password Reset",
      `
      <h2>Reset Password</h2>
      <p>Copy this link and paste in browser:</p>
      <p style="word-break: break-all;">${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      `
    );

    res.status(200).json({ message: "Password reset email sent" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // 1. hash incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 2. find user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 3. hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. clear reset fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//LOGOUT 
export const logoutUser = async (req, res) => {
  try {
    // JWT stateless hota hai, to sirf response bhejna hota hai
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


