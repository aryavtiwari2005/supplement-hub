import { NextResponse } from "next/server";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(req: Request) {
  const { phone } = await req.json();

  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily (you might want to use Redis or a database)
    // For this example, we'll assume it's stored in a simple in-memory store
    // In production, use a proper storage solution
    const otpStore = new Map();
    otpStore.set(phone, { otp, expires: Date.now() + 5 * 60 * 1000 }); // 5 minutes expiry

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+1${phone}`, // Adjust country code as needed
    });

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
