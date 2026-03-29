import nodemailer from "nodemailer";
import admin from "firebase-admin";

// 🔥 Initialize Firebase Admin (ONLY ONCE)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // ✅ 1. SAVE TO FIREBASE
    await db.collection("contact_messages").add({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    // ✅ 2. EMAIL SETUP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ 3. SEND EMAIL TO YOU
    await transporter.sendMail({
      from: `"WAHAT MTQ Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `New Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    // ✅ 4. AUTO REPLY TO CUSTOMER
    await transporter.sendMail({
      from: `"WAHAT MTQ CHEMICALS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting WAHAT MTQ CHEMICALS.</p>
        <p>We have received your message and will get back to you shortly.</p>
        <br/>
        <p><b>Your Message:</b></p>
        <p>${message}</p>
        <br/>
        <p>Best regards,<br/>WAHAT MTQ Team</p>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
