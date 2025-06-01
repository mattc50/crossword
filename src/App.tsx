import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";
import AuthForm from "./screens/AuthForm";
import LandingPage from "./screens/LandingPage";
import GamePage from "./screens/GamePage";

function App() {
  const [user, setUser] = useState<{ uid: string, name: string; phone: string, achievements: any[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false);

  useEffect(() => {
    console.log("User state updated:", user);
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        if (isCreatingUser) {
          console.log("User creation in progress. Deferring user state update...");
          setLoading(false);
          return; // Defer handling the user state until user creation is complete
        }
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as { uid: string, name: string; phone: string, achievements: any[] };
            setUser({ uid: userDoc.id, ...userData });
          } else {
            console.log("User does not exist. Redirecting to /auth...");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isCreatingUser]);

  if (loading) return <p>Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={user || isCreatingUser ? <Navigate to="/" replace /> : <AuthForm setIsCreatingUser={setIsCreatingUser} setUser={setUser} />}
        />
        <Route
          path="/"
          element={
            user
              ? <LandingPage user={user} setUser={setUser} />
              : isCreatingUser
                ? <p>Authenticating...</p> // Show a temporary message while authenticating
                : <Navigate to="/auth" replace />
          }
        />
        <Route
          path="/edit/:name"
          element={
            user
              ? <GamePage user={user} />
              : <Navigate to="/auth" replace />
          }
        />
        <Route path="*" element={<Navigate to={user ? "/" : "/auth"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;