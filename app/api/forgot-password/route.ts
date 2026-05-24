import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dbConnect from "@/lib/dbConnect"; // adjust to your db connect path
import User from "@/models/User";        // adjust to your User model path

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success even if user not found — prevents email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Set up Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an App Password, not your Gmail password
      },
    });
    await transporter.verify();
console.log("Transporter verified OK");

 


const info = await transporter.sendMail({
  from: `"Your App" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: "Reset your password",
  html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="margin-bottom: 8px;">Reset your password</h2>
          <p style="color: #555;">
            Click the button below to reset your password. This link expires in <strong>1 hour</strong>.
          </p>
          <a href="${resetUrl}" style="
            display: inline-block;
            margin: 24px 0;
            padding: 12px 28px;
            background: #16a34a;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          ">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px;">
            If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #ccc; font-size: 12px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>`,
});

console.log("Email sent:", info.messageId);
console.log("Accepted:", info.accepted);
console.log("Rejected:", info.rejected);

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (error) {
  console.error("Forgot password error:", error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : String(error) },
    { status: 500 }
  );

  }
}