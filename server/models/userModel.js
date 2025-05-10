import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    isAccountVerified: { type: Boolean, default: false },

    // For email verification
    verifyOtp: { type: String, default: "" },
    sendVerifyOtpExpireAt: { type: Date },

    // ✅ Add these for password reset
    resetOtp: { type: String, default: "" },
    resetOtpExpireAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
