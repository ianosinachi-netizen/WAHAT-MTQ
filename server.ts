import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini Translation API
  app.post("/api/ai/translate", async (req, res) => {
    const { texts, targetLanguage } = req.body;

    if (!texts || !targetLanguage) {
      return res.status(400).json({ error: "Texts and targetLanguage are required." });
    }

    try {
      const prompt = `Translate the following list of strings to ${targetLanguage}. 
      Context: These are UI labels, buttons, and content for a professional chemical company website (Wahat MTQ Chemicals).
      Return the translations as a JSON object where keys are the original strings and values are the translations. 
      Return ONLY the JSON object: ${JSON.stringify(texts)}`;

      const response = await genAI.models.generateContent({
        model: "gemini-1.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "{}";
      
      try {
        const json = JSON.parse(text);
        res.json(json);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        res.status(500).json({ error: "Invalid response format from AI." });
      }
    } catch (error: any) {
      console.error("Gemini Translation Error:", error);
      res.status(500).json({ error: error.message || "Failed to translate." });
    }
  });

  // Groq API Proxy
  app.post("/api/ai/groq", async (req, res) => {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
    }

    try {
      const groq = new Groq({ apiKey });
      const completion = await groq.chat.completions.create({
        messages,
        model: "llama-3.3-70b-versatile",
      });

      res.json({ text: completion.choices[0]?.message?.content || "" });
    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch from Groq." });
    }
  });

  // Email Test API
  app.get("/api/test-email", async (req, res) => {
    const smtpUser = process.env.SMTP_USER?.trim();
    const smtpPass = process.env.SMTP_PASS?.trim().replace(/\s/g, "");
    const ownerEmail = process.env.OWNER_EMAIL?.trim();

    if (!smtpUser || !smtpPass || !ownerEmail) {
      return res.status(500).json({ 
        error: "Configuration missing", 
        hasUser: !!smtpUser, 
        hasPass: !!smtpPass, 
        hasOwner: !!ownerEmail 
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    try {
      await transporter.verify();
      res.json({ success: true, message: "SMTP connection verified successfully!" });
    } catch (error: any) {
      console.error("[TEST ERROR] SMTP Verification Failed:", error);
      res.status(500).json({ error: error.message || "SMTP verification failed." });
    }
  });

  // Email API
  app.post("/api/send-email", async (req, res) => {
    const { type, userEmail, details } = req.body;

    // Input Validation
    if (!userEmail || !userEmail.includes("@")) {
      return res.status(400).json({ error: "A valid user email is required." });
    }
    if (!type || !details) {
      return res.status(400).json({ error: "Request type and details are required." });
    }

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER?.trim();
    // Gmail App Passwords are 16 chars, often displayed with spaces. 
    // We trim and remove internal spaces to be safe.
    const smtpPass = process.env.SMTP_PASS?.trim().replace(/\s/g, "");
    const ownerEmail = process.env.OWNER_EMAIL?.trim();

    if (!smtpUser || !smtpPass || !ownerEmail) {
      console.error("[ERROR] Missing Email Secrets:", { 
        hasUser: !!smtpUser, 
        hasPass: !!smtpPass, 
        hasOwner: !!ownerEmail 
      });
      return res.status(500).json({ error: "Server email configuration is incomplete. Please set SMTP_USER, SMTP_PASS, and OWNER_EMAIL in Secrets." });
    }

    // Direct Gmail SMTP configuration for maximum reliability
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      // Verify connection configuration
      await transporter.verify();

      const timestamp = new Date().toLocaleString();
      let subject = "";
      let userMessage = "";
      let ownerMessage = "";

      switch (type) {
        case "chemical_order":
          subject = "Chemical Order Request Confirmation";
          userMessage = "Thank you for your chemical order request. Our technical sales team will review your requirements and contact you shortly with a formal quote.";
          ownerMessage = "New Chemical Order Request received.";
          break;
        case "bulk_request":
          subject = "Bulk Chemical Request Confirmation";
          userMessage = "Thank you for your bulk chemical request. Our procurement specialists will review your requirements and contact you shortly.";
          ownerMessage = "New Bulk Chemical Request received.";
          break;
        case "barite_order":
          subject = "Barite Order Confirmation";
          userMessage = "Thank you for your Barite order. Our sales team will review your request and contact you with a formal quote.";
          ownerMessage = "New Barite Order placed.";
          break;
        case "product_order":
          subject = "Product Order Confirmation";
          userMessage = "Thank you for your product order. We have received your request and are processing it.";
          ownerMessage = "New Product Order received.";
          break;
        case "contact_message":
          subject = "Contact Inquiry Received";
          userMessage = "Thank you for contacting us. We have received your message and will get back to you as soon as possible.";
          ownerMessage = "New Contact Inquiry from website.";
          break;
        default:
          subject = "Wahat MTQ Notification";
          userMessage = "Thank you for your interaction with Wahat MTQ Chemicals.";
          ownerMessage = "New interaction on website.";
      }

      // 1. Send Owner Notification
      await transporter.sendMail({
        from: `"Wahat MTQ System" <${smtpUser}>`,
        to: ownerEmail,
        subject: `[${type.toUpperCase()}] ${ownerMessage}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0d9488;">${ownerMessage}</h2>
            <p><strong>User Email:</strong> ${userEmail}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
              <h3 style="margin-top: 0;">Details:</h3>
              <pre style="white-space: pre-wrap; font-family: inherit;">${details}</pre>
            </div>
          </div>
        `,
      });

      // 2. Send User Confirmation
      await transporter.sendMail({
        from: `"Wahat MTQ Chemicals" <${smtpUser}>`,
        to: userEmail,
        subject: subject,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #0d9488;">${subject}</h2>
            <p>Hello,</p>
            <p>${userMessage}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <div style="background: #f0fdfa; padding: 15px; border-radius: 8px; border: 1px solid #ccfbf1;">
              <h3 style="margin-top: 0; color: #0f766e;">Summary of your request:</h3>
              <pre style="white-space: pre-wrap; font-family: inherit;">${details}</pre>
            </div>
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
              This is an automated confirmation. Please do not reply directly to this email.
            </p>
          </div>
        `,
      });

      console.log(`[SUCCESS] Email sent for ${type} to ${userEmail} and owner.`);
      res.json({ success: true, message: "Emails sent successfully." });
    } catch (error: any) {
      console.error("[ERROR] Email Notification System Failure:", error);
      res.status(500).json({ error: "Failed to process email notifications. Please check server logs." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
