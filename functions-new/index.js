const functions = require("firebase-functions");
const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp();

// Auth-protected HTTPS function
exports.ping = functions.https.onRequest(async (req, res) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).send("Unauthorized: No ID token provided.");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const apiKey = process.env.VITE_FIREBASE_API_KEY || "Missing";

    res.status(200).send(`Hello ${uid}, your Firebase API Key is: ${apiKey}`);
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(403).send("Forbidden: Invalid token.");
  }
});
