import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTempletes.js";

// =================== Register ===================
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing Details" });
    }

    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Welcome to WebSite",
            text: `Welcome! Your account has been created with email: ${email}`,
        };

        await transporter.sendMail(mailOption);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =================== Login ===================
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// =================== Logout ===================
export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    return res.status(200).json({ success: true, message: "Logged Out" });
};

// =================== Send Verify OTP ===================
export const sendVerifyOtp = async (req, res) => {
    try {
      const user = await userModel.findById(req.userId);
      if (!user) return res.json({ success: false, message: "User not found" });
      if (user.isAccountVerified) return res.json({ success: false, message: "Account already verified" });
  
      // Generate OTP and set expiry time (24 hours)
      const otp = String(Math.floor(100000 + Math.random() * 900000)); 
      user.verifyOtp = otp;
      user.sendVerifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
  
      // Save the user document with OTP and expiry time
      await user.save();
  
      // Log OTP and expiry time for debugging
      console.log("Generated OTP: ", otp);
      console.log("OTP Expiry Time: ", user.sendVerifyOtpExpireAt);
  
      // Send OTP via email
      await transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Account Verification OTP",
        //text: `Your OTP is ${otp}`,
        html:EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
      });
  
      // Send success response
      res.json({ success: true, message: "Verification OTP sent to email" });
    } catch (error) {
      // Error handling
      console.error(error);
      res.json({ success: false, message: error.message });
    }
  };  

// =================== Verify Email OTP ===================
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    if (!otp) return res.json({ success: false, message: "Missing OTP" });
  
    try {
      const user = await userModel.findById(req.userId);
      if (!user) return res.json({ success: false, message: "User not found" });
  
      // Log entered OTP, stored OTP, and expiry time for debugging
      console.log("OTP entered by user: ", otp);
      console.log("Stored OTP in DB: ", user.verifyOtp);
      console.log("OTP Expiry Time: ", user.sendVerifyOtpExpireAt);
      console.log("Current Time: ", Date.now());
  
      // Check if the OTP matches and hasn't expired
      if (user.verifyOtp !== otp || user.sendVerifyOtpExpireAt < Date.now()) {
        return res.json({ success: false, message: "Invalid or expired OTP" });
      }
  
      // Mark account as verified and reset OTP and expiry time
      user.isAccountVerified = true;
      user.verifyOtp = "";
      user.sendVerifyOtpExpireAt = 0;
  
      // Save the updated user document
      await user.save();
  
      // Send success response
      return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
      // Error handling
      console.error(error);
      return res.json({ success: false, message: error.message });
    }
  };  
// =================== Is Authenticated ===================
export const isAuthenticated = (req, res) => {
    return res.json({ success: true });
};

// =================== Send Reset OTP ===================
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Email is required" });

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 min

        await user.save();

        await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            //text: `Your OTP for password reset is ${otp}.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        });

        console.log("Sent Password Reset OTP:", otp); // for debugging

        return res.json({ success: true, message: "OTP sent to your email" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// =================== Reset Password ===================
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "All fields are required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User not found" });

        // Convert OTPs to string and trim
        const storedOtp = String(user.resetOtp || "").trim();
        const inputOtp = String(otp).trim();

        console.log("Stored OTP:", storedOtp);
        console.log("Input OTP:", inputOtp);
        console.log("Expiry Time:", user.resetOtpExpireAt, "Current Time:", Date.now());

        // Check if OTP is expired
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        // Check if OTP matches
        if (storedOtp !== inputOtp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        // Optional: Prevent using the same password again
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.json({ success: false, message: "New password must be different from old password" });
        }

        // Hash and update password
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOtp = "";
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: "Password has been reset successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        return res.json({ success: false, message: error.message });
    }
};