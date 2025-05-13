/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

// Function to send verification code for registration
export const sendVerificationCode = functions.https.onCall(
  async (data: {email: string}) => {
    const {email} = data;
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Store the code in Firestore with a 5-minute expiration
    await admin.firestore().collection("verificationCodes").doc(email).set({
      code,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      ),
    });
    // Send the code via email
    try {
      await transporter.sendMail({
        from: functions.config().email.user,
        to: email,
        subject: "Your ThaiTune Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #F5F5F5;
                margin: 0;
                padding: 0;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-wrapper {
                border: 4px solid #4A1D2C;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background-color: #800000;
                color: white;
                padding: 20px;
                text-align: center;
              }
              .logo {
                width: 120px;
                height: auto;
                margin-bottom: 10px;
              }
              .content {
                background-color: white;
                padding: 30px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #4A1D2C;
                text-align: center;
                padding: 20px;
                margin: 20px 0;
                letter-spacing: 8px;
                border: 2px solid #E5E5E5;
                border-radius: 8px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666666;
                font-size: 14px;
                padding: 15px;
                background-color: #f9f9f9;
                border-top: 1px solid #E5E5E5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="header">
                  <img src="https://thaitune.com/images/thaitune-logo.png" alt="ThaiTune Logo" class="logo">
                  <h1>Verify Your Email</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Thank you for using ThaiTune. Please enter the verification code below:</p>
                  
                  <div class="code">${code}</div>
                  
                  <p>This code will expire in 5 minutes.</p>
                  
                  <p>If you didn't request this code, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ThaiTune. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      return {success: true};
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send verification code"
      );
    }
  }
);

// Function to verify registration code
export const verifyCode = functions.https.onCall(
  async (data: {email: string; code: string}) => {
    const {email, code} = data;
    // Get the stored code from Firestore
    const doc = await admin.firestore()
      .collection("verificationCodes").doc(email).get();
    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "No verification code found"
      );
    }
    const {code: storedCode, expiresAt} = doc.data() as {
      code: string;
      expiresAt: FirebaseFirestore.Timestamp;
    };
    // Check if code has expired
    if (expiresAt.toDate() < new Date()) {
      await doc.ref.delete(); // Clean up expired code
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Verification code has expired"
      );
    }
    // Verify the code
    if (code !== storedCode) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid verification code"
      );
    }
    // Code is valid - clean up
    await doc.ref.delete();
    return {success: true};
  }
);

// Function to send 2FA code
export const send2faCode = functions.https.onCall(
  async (data: {email: string}, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to request 2FA code"
      );
    }
    const {email} = data;
    const uid = context.auth.uid;
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Store the code in Firestore with a 5-minute expiration
    await admin.firestore().collection("2faCodes").doc(uid).set({
      code,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      ),
    });
    // Send the code via email
    try {
      await transporter.sendMail({
        from: functions.config().email.user,
        to: email,
        subject: "Your ThaiTune Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #F5F5F5;
                margin: 0;
                padding: 0;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-wrapper {
                border: 4px solid #4A1D2C;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background-color: #800000;
                color: white;
                padding: 20px;
                text-align: center;
              }
              .logo {
                width: 120px;
                height: auto;
                margin-bottom: 10px;
              }
              .content {
                background-color: white;
                padding: 30px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #4A1D2C;
                text-align: center;
                padding: 20px;
                margin: 20px 0;
                letter-spacing: 8px;
                border: 2px solid #E5E5E5;
                border-radius: 8px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666666;
                font-size: 14px;
                padding: 15px;
                background-color: #f9f9f9;
                border-top: 1px solid #E5E5E5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="header">
                  <img src="https://thaitune.com/images/thaitune-logo.png" alt="ThaiTune Logo" class="logo">
                  <h1>Two-Factor Authentication</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Please enter the verification code below to complete the authentication process:</p>
                  
                  <div class="code">${code}</div>
                  
                  <p>This code will expire in 5 minutes.</p>
                  
                  <p>If you didn't request this code, please secure your account immediately.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ThaiTune. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      return {success: true};
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send verification code"
      );
    }
  }
);

// Function to verify 2FA code
export const verify2faCode = functions.https.onCall(
  async (data: {code: string}, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to verify 2FA code"
      );
    }
    const {code} = data;
    const uid = context.auth.uid;
    // Get the stored code from Firestore
    const doc = await admin.firestore().collection("2faCodes").doc(uid).get();
    if (!doc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "No verification code found"
      );
    }
    const {code: storedCode, expiresAt} = doc.data() as {
      code: string;
      expiresAt: FirebaseFirestore.Timestamp;
    };
    // Check if code has expired
    if (expiresAt.toDate() < new Date()) {
      await doc.ref.delete(); // Clean up expired code
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Verification code has expired"
      );
    }
    // Verify the code
    if (code !== storedCode) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid verification code"
      );
    }
    // Code is valid - clean up
    await doc.ref.delete();
    return {success: true};
  }
);

// Function to enable/disable 2FA for a user
export const update2faSettings = functions.https.onCall(
  async (data: {enabled: boolean}, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to update 2FA settings"
      );
    }
    const uid = context.auth.uid;
    const {enabled} = data;
    // Update user's 2FA settings in Firestore
    await admin.firestore().collection("userSettings").doc(uid).set({
      twoFactorEnabled: enabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
    return {success: true};
  }
);

// Function to check if 2FA is enabled for a user
export const get2faSettings = functions.https.onCall(
  async (data: unknown, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be logged in to get 2FA settings"
      );
    }
    const uid = context.auth.uid;
    // Get user's 2FA settings from Firestore
    const doc = await admin.firestore().collection("userSettings").doc(uid).get();
    if (!doc.exists) {
      return {twoFactorEnabled: false};
    }
    return {
      twoFactorEnabled: doc.data()?.twoFactorEnabled || false,
    };
  }
);
