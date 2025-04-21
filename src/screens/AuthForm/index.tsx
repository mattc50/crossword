import { useEffect, useState, useRef } from "react";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import PinInput from "../../components/PinInput";
import { saveUser } from "../../firebase/db";
import PhoneInput from "../../components/PhoneInput";
import TextField from "../../components/TextFields/TextField";
import "./styles.css";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  // setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCreatingUser: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<{ name: string; phone: string, achievements: any[] } | null>>;
}

const AuthForm = ({ setIsCreatingUser, setUser }: AuthFormProps) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState<string>("");
  const stepRef = useRef<"enterPhone" | "enterCode">("enterPhone"); // Persist step state
  const [step, setStep] = useState<"enterPhone" | "enterCode">("enterPhone");
  // const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);

  const navigate = useNavigate();

  // console.log(step, stepRef.current);
  console.log(phoneNumber);
  // console.log(stepRef.current);


  // Initializes Firebase Authentication instance
  const auth = getAuth();

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    console.log("AuthForm mounted");
    return () => console.log("AuthForm unmounted");
  }, []);

  // This effect sets up an invisible reCAPTCHA verifier
  // useEffect(() => {
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(
  //       auth, //Firebase Auth instance
  //       "recaptcha-container", // The ID of the container where the reCAPTCHA will be rendered
  //       { size: "invisible" }, // Configures the reCAPTCHA to be invisible
  //     );

  //     // Render the reCAPTCHA widget
  //     window.recaptchaVerifier.render().catch(console.error);
  //   }

  //   return () => {
  //     // Cleanup reCAPTCHA verifier if needed
  //     // window.recaptchaVerifier = undefined;
  //     window.recaptchaVerifier?.clear(); // Clear the reCAPTCHA verifier
  //   };
  // }, [auth]);
  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      const verifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
      verifier.render().catch(console.error);
      recaptchaVerifierRef.current = verifier;
    }
  }, [auth]);

  // Sends a verification code to the user's phone number
  const sendVerificationCode = async () => {
    console.log("Sending verification code...");
    try {
      // setProcessing(true);


      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        // window.recaptchaVerifier
        recaptchaVerifierRef.current!
      );

      window.confirmationResult = confirmation;

      stepRef.current = "enterCode"; // Persist step state
      setStep("enterCode");
    } catch (error) {
      console.error("Error sending verification code:", error);
      // } finally {
      //   setProcessing(false);
      // }
    };
  };

  // Verifies the code entered by the user
  const verifyCode = async () => {
    try {
      setProcessing(true);
      setIsCreatingUser(true);
      const result = await window.confirmationResult.confirm(code); // Attempt to verify the code
      const user = result.user;

      console.log("User authenticated:", user);

      const userData = {
        name,
        phone: user.phoneNumber || "Unknown",
        achievements: [],
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      await saveUser(user.uid, userData.name, userData.phone); // Save user data
      setUser(userData);

      // Update the UI to reflect the authenticated state
      // if (userData && userData.name && userData.phone) navigate("/");
      navigate("/");
    } catch (error) {
      console.error("Error verifying code:", error);

      // Handle incorrect PIN or other errors
      if (typeof error === "object" && error !== null && "code" in error) {
        const firebaseError = error as { code: string };

        if (firebaseError.code === "auth/invalid-verification-code") {
          alert("The PIN you entered is incorrect. Please try again.");
        } else {
          alert("An error occurred while verifying the PIN. Please try again.");
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }

      // Keep the user on the PIN entry page
      stepRef.current = "enterCode"; // Persist step state
      setStep("enterCode");
    } finally {
      setProcessing(false);
      setIsCreatingUser(false);
    }
  };

  if (processing) return <div>Loading...</div>;

  return (
    <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
      {stepRef.current === "enterPhone" && (
        <>
          <TextField
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <PhoneInput value={phoneNumber} setValue={setPhoneNumber} showCountryDropdown={true} />
          <button onClick={sendVerificationCode}>Send Code</button>
        </>
      )}

      {stepRef.current === "enterCode" && (
        <>
          <PinInput
            setValue={setCode}
          />
          <button onClick={verifyCode}>Verify Code</button>
        </>
      )}

      <div id="recaptcha-container" />
    </form>
  );
};

export default AuthForm;
