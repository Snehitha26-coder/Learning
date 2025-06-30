// server.js
import dotenv from 'dotenv';
dotenv.config();

import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';

import connectionToDB from './config/dbConnection.js';
import app from './app.js';
const PORT = process.env.PORT || 5000;

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Razorpay config
console.log("Loaded Razorpay ENV:");
console.log("RAZORPAY_KEY_ID:", JSON.stringify(process.env.RAZORPAY_KEY_ID));
console.log("RAZORPAY_SECRET:", JSON.stringify(process.env.RAZORPAY_SECRET));

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("❌ Razorpay keys are missing. Check your .env file and dotenv.config()");
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Start server
app.listen(PORT, async () => {
  await connectionToDB();
  console.log(`✅ App is running at http://localhost:${PORT}`);
});


