import nodemailer from "nodemailer";
import admin from "firebase-admin";

// ✅ 🔥 PASTE IT RIGHT HERE (UNDER IMPORTS)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

// ✅ AFTER THAT
const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    // ✅ SAVE TO FIREBASE
    await db.collection("contact_messages").add({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    // ✅ EMAIL SETUP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ SEND TO YOU
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.OWNER_EMAIL,
      subject: "New Message",
      text: message,
    });

    // ✅ AUTO REPLY
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "We received your message",
      text: "Thank you for contacting us. We will reply soon.",
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error sending message" });
  }
}
