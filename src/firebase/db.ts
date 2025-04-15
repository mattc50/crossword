import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { User } from "../types/user";

export const saveUser = async (user: User) => {
  const ref = doc(db, "users", user.uid);
  await setDoc(ref, user, { merge: true });
};
