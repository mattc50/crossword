import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { User } from "../types/user";

// export const saveUser = async (user: User) => {
//   const ref = doc(db, "users", user.uid);
//   await setDoc(ref, user, { merge: true });
// };

export const saveUser = async (uid: string, name: string, phone: string) => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Invalid name: Name must be a non-empty string.");
  }

  if (!phone || typeof phone !== "string" || !/^\+\d{10,15}$/.test(phone)) {
    throw new Error("Invalid phone: Phone must be in E.164 format.");
  }

  const userDocRef = doc(db, "users", uid);

  await setDoc(
    userDocRef,
    {
      name,
      phone,
      lastLogin: new Date(),
    },
    { merge: true }
  );

  console.log("User saved successfully.");
};