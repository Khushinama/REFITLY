import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { validateName, validateEmail, validatePassword, validateOTP } from "../utils/validators.js";
// REGISTER
export const registerUser = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    let errors = {};

    const nameError = validateName(name);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpiresAt = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationOtp,
      verificationOtpExpiresAt
    });

    await sendEmail(
      user.email,
      "Verify your ReFitly email",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf9; padding: 30px; border-radius: 12px; border: 1px solid #eae5de;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e3a40; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px;">ReFitly</h2>
        </div>
        <p style="color: #333; text-align: center; font-size: 16px; line-height: 1.5;">Please use the following 6-digit code to verify your email address and start styling smarter.</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #eae5de; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h1 style="color: #1e3a40; letter-spacing: 8px; margin: 0; font-size: 36px;">${verificationOtp}</h1>
        </div>
        <p style="color: #666; text-align: center; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
      `
    );

    res.status(201).json({
      message: "OTP sent to your email.",
      email: user.email
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

    let errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

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


// VERIFY OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    let errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    const otpError = validateOTP(otp);
    if (otpError) errors.otp = otpError;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (!user.verificationOtp || user.verificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.verificationOtpExpiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // verify user
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpiresAt = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    let errors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationOtpExpiresAt = Date.now() + 10 * 60 * 1000;

    user.verificationOtp = verificationOtp;
    user.verificationOtpExpiresAt = verificationOtpExpiresAt;
    await user.save();

    await sendEmail(
      user.email,
      "Your new ReFitly verification code",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #fcfbf9; padding: 30px; border-radius: 12px; border: 1px solid #eae5de;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e3a40; margin: 0; font-family: 'Playfair Display', serif; font-size: 28px;">ReFitly</h2>
        </div>
        <p style="color: #333; text-align: center; font-size: 16px; line-height: 1.5;">You requested a new verification code. Please use the 6-digit code below to verify your email address.</p>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0; border: 1px solid #eae5de; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h1 style="color: #1e3a40; letter-spacing: 8px; margin: 0; font-size: 36px;">${verificationOtp}</h1>
        </div>
        <p style="color: #666; text-align: center; font-size: 14px;">This code will expire in 10 minutes.</p>
      </div>
      `
    );

    res.status(200).json({ message: "A new OTP has been sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ message: "Validation failed", errors: { email: emailError } });
    }

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

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: "Validation failed", errors: { password: passwordError } });
    }

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


