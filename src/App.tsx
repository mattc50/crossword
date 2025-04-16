import { useEffect, useState } from 'react'
import './App.css'
import FirebaseTest from './FirebaseTest'
import AuthForm from './components/AuthForm'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase/firebase'

function App() {
  const [user, setUser] = useState<{ name: string, phone: string } | null>(null)
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as { name: string; phone: string };
            setUser(userData);
          } else {
            console.error("User document not found.");
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
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); //Sign out the user
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  if (loading || processing) return <p>Loading...</p>;
  // if (error) return <p>{error}</p>;

  console.log(user);

  return (
    <div>
      <h1>My Game</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Your phone number: {user.phone}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <>
          {/* <FirebaseTest /> */}
          <AuthForm setProcessing={setProcessing} setUser={setUser} />
        </>
      )}
    </div>
  )
}

export default App
