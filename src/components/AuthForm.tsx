import { useEffect, useState } from "react";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier, getAdditionalUserInfo } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const AuthForm = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"enterPhone" | "enterCode">("enterPhone");

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
      // Sends an SMS verification code to the provided phone number
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmation; // Store the confirmation result globally for later use
      setStep("enterCode");
    } catch (error) {
      console.error("Error sending verification code:", error);
    }
  };

  // Verifies the code entered by the user
  const verifyCode = async () => {
    try {
      // Confirm the verification code entered by the user
      const result = await window.confirmationResult.confirm(code);
      const user = result.user; // Get the authenticated user object

      // Use getAdditionalUserInfo to check if the user is new
      const additionalUserInfo = getAdditionalUserInfo(result);
      if (additionalUserInfo?.isNewUser) {
        // If the user is new, save their data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          phone: user.phoneNumber,
          createdAt: new Date(),
        });
        console.log("New user registered:", user);
      } else {
        console.log("Existing user signed in:", user);
      }
    } catch (error) {
      console.error("Error verifying code:", error);
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
          <input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verifyCode}>Verify Code</button>
        </div>
      )}

      <div id="recaptcha-container" />
    </div>
  );
};

export default AuthForm;
