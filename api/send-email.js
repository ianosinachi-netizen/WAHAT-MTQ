import nodemailer from "nodemailer";
import admin from "firebase-admin";

// 🔥 Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ 1. Save to Firebase
    await db.collection("contact_messages").add({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    // ✅ 2. Setup email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ 3. Send email to you (admin)
    await transporter.sendMail({
      from: `"WAHAT MTQ Website" <${process.env.SMTP_USER}>`,
      to: process.env.OWNER_EMAIL,
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    // ✅ 4. Auto reply to user
    await transporter.sendMail({
      from: `"WAHAT MTQ CHEMICALS" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for contacting WAHAT MTQ CHEMICALS.</p>
        <p>We have received your message and will reply shortly.</p>
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
