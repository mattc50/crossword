/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

export const saveUser = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to call this function."
    );
  }

  const { uid } = context.auth;
  const { name, phone, achievemments } = data;

  // Validate input
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'name' field is required and must be a non-empty string."
    );
  }

  if (!phone || typeof phone !== "string" || !/^\+\d{10,15}$/.test(phone)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The 'phone' field is required and must be a valid phone number in E.164 format."
    );
  }

  const userDocRef = db.collection("users").doc(uid);

  try {
    // Create or update the user document
    await userDocRef.set(
      {
        name,
        phone,
        achievemments: achievemments || [],
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, message: "User saved successfully." };
  } catch (error) {
    console.error("Error saving user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while saving the user."
    );
  }
});

export const getUser = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to call this function."
    );
  }

  const { uid } = context.auth;

  const userDocRef = db.collection("users").doc(uid);

  try {
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "User document not found."
      );
    }

    return { success: true, data: userDoc.data() };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while fetching the user."
    );
  }
});