import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const saveUser = async (uid: string, name: string, phone: string) => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid name: Name must be a non-empty string.");
  }

  if (!phone || typeof phone !== "string" || !/^\+\d{10,15}$/.test(phone)) {
    throw new Error("Invalid phone: Phone must be in E.164 format.");
  }

  const userDocRef = doc(db, "users", uid);

  try {
    // Check if the user document already exists
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      console.log("User already exists. Fetching existing data...");
      return userDoc.data(); // Return existing user data
    }

    // Save the new user data if the document doesn't exist
    const newUser = {
      name,
      phone,
      achievements: [],
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    await setDoc(userDocRef, newUser);
    console.log("New user saved successfully.");
    return newUser; // Return newly created user data
  } catch (error) {
    console.error("Error saving or fetching user:", error);
    throw new Error("Failed to save or fetch user.");
  }
};