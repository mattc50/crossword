import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import FirebaseTest from './FirebaseTest'
import AuthForm from './components/AuthForm'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase/firebase'

function App() {
  // const [count, setCount] = useState(0)
  const [user, setUser] = useState<{ name: string, phone: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If user is logged in, fetch user data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          setUser(userDoc.data() as { name: string, phone: string })
        } else {
          console.log('No such document!')
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth); //Sign out the user
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  if (loading) return <p>Loading...</p>;

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
          <FirebaseTest />
          <AuthForm />
        </>
      )}
    </div>
    // <>
    //   <div>
    //     <a href="https://vite.dev" target="_blank">
    //       <img src={viteLogo} className="logo" alt="Vite logo" />
    //     </a>
    //     <a href="https://react.dev" target="_blank">
    //       <img src={reactLogo} className="logo react" alt="React logo" />
    //     </a>
    //   </div>
    //   <h1>Vite + React</h1>
    //   <div className="card">
    //     <button onClick={() => setCount((count) => count + 1)}>
    //       count is {count}
    //     </button>
    //     <p>
    //       Edit <code>src/App.tsx</code> and save to test HMR
    //     </p>
    //   </div>
    //   <p className="read-the-docs">
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>
  )
}

export default App
