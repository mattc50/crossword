import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import "./styles.css";

interface LandingPageProps {
  user: { name: string; phone: string, achievements: any[] };
  setUser: React.Dispatch<React.SetStateAction<{ name: string; phone: string, achievements: any[] } | null>>;
}

const LandingPage = ({ user, setUser }: LandingPageProps) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="landing-page-container">
      <h1>Welcome, {user.name}!</h1>
      <p>Your phone number: {user.phone}</p>
      {user.achievements.length === 0
        ? <p>No achievements yet</p>
        : <ul>
          {user.achievements.map((achievement, index) => (
            <li key={index}>{achievement.name}</li>
          ))}
        </ul>
      }
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LandingPage;