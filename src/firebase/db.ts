import { addDoc, collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { getAuth } from "firebase/auth";

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
      return { id: userDoc.id, ...userDoc.data() }; // Return existing user data
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
    return { id: userDocRef.id, ...newUser }; // Return newly created user data
  } catch (error) {
    console.error("Error saving or fetching user:", error);
    throw new Error("Failed to save or fetch user.");
  }
};

export const saveGame = async (gameData: { userId: string, name: string; createdAt: Timestamp }) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser; // Get the current user
    console.log(gameData.userId);

    if (!gameData.userId) {
      throw new Error("User is not authenticated.");
    }

    // const userId = user.uid;
    const gamesRef = collection(db, "games"); // Reference to the "games" collection

    // const newGame = {
    //   ...gameData,
    //   userId, // Associate the game with the user
    // };

    console.log("The new game:", gameData);
    console.log("Authenticated user ID:", user.uid, typeof user.uid);
    console.log("Game data userId:", gameData.userId, typeof gameData.userId)
    console.log("Date type:", typeof gameData.createdAt);
    console.log(gameData.userId === user.uid);

    const docRef = await addDoc(gamesRef, gameData); // Firestore generates a unique ID
    console.log("Game saved with ID:", docRef.id);
    return docRef.id; // Return the generated ID if needed
  } catch (error) {
    console.error("Error saving game:", error);
    throw error;
  }
};