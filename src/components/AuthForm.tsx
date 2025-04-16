import { useEffect, useState } from "react";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import PinInput from "./PinInput";

interface AuthFormProps {
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<{ name: string; phone: string } | null>>;
}

const AuthForm = ({ setProcessing, setUser }: AuthFormProps) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState<string>("");
  const [step, setStep] = useState<"enterPhone" | "enterCode" | "authenticated">("enterPhone");

  // Initializes Firebase Authentication instance
  const auth = getAuth();

  // This effect sets up an invisible reCAPTCHA verifier
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth, //Firebase Auth instance
        "recaptcha-container", // The ID of the container where the reCAPTCHA will be rendered
        { size: "invisible" }, // Configures the reCAPTCHA to be invisible
      );

      // Render the reCAPTCHA widget
      window.recaptchaVerifier.render().catch(console.error);
    }
  }, [auth]);

  // Sends a verification code to the user's phone number
  const sendVerificationCode = async () => {
    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmation;
      setStep("enterCode");
    } catch (error) {
      console.error("Error sending verification code:", error);
    }
  };

  // Verifies the code entered by the user
  const verifyCode = async () => {
    try {
      setProcessing(true);
      const result = await window.confirmationResult.confirm(code);
      const user = result.user;

      console.log("User authenticated:", user);

      // Check if the Firestore document exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = {
        name,
        phone: user.phoneNumber || "Unknown",
      };
      await saveUser(user.uid, userData.name, userData.phone);

      // let userData: { name: string, phone: string };
      // if (!userDoc.exists()) {
      //   // Create a new Firestore document for the user
      //   const newUserData = {
      //     name,
      //     phone: user.phoneNumber || "Unknown",
      //     createdAt: new Date(),
      //     lastLogin: new Date(),
      //   };
      //   await setDoc(userDocRef, newUserData);
      //   console.log("New user document created.");
      //   userData = {
      //     name: newUserData.name,
      //     phone: newUserData.phone,
      //   };
      // } else {
      //   // Update the lastLogin field for existing users
      //   const existingUserData = userDoc.data() as { name: string; phone: string };

      //   await setDoc(
      //     userDocRef,
      //     { lastLogin: new Date() },
      //     { merge: true }
      //   );
      //   console.log("User document updated.");

      //   // Extract only the required fields
      //   userData = { name: existingUserData.name, phone: existingUserData.phone };
      // }
      setUser(userData as { name: string; phone: string });

      // Update the UI to reflect the authenticated state
      setStep("authenticated");
    } catch (error) {
      console.error("Error verifying code:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      {step === "enterPhone" && (
        <div>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="tel"
            placeholder="+1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button onClick={sendVerificationCode}>Send Code</button>
        </div>
      )}

      {step === "enterCode" && (
        <div>
          {/* <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          /> */}
          <PinInput
            setValue={setCode}
          />
          <button onClick={verifyCode}>Verify Code</button>
        </div>
      )}

      <div id="recaptcha-container" />
    </div>
  );
};

export default AuthForm;
