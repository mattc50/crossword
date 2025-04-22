import { getAuth, signOut } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import "./styles.css";
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, Timestamp, where } from "firebase/firestore";
import { saveGame } from "../../firebase/db";

interface LandingPageProps {
  user: { uid: string, name: string; phone: string, achievements: any[] };
  setUser: React.Dispatch<React.SetStateAction<{ name: string; phone: string, achievements: any[] } | null>>;
}

const LandingPage = ({ user, setUser }: LandingPageProps) => {
  // const [games, setGames] = useState<{ id: string, name: string }[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);

  const fetchGamesForUser = async (userId: string) => {
    // console.log(userId);
    try {
      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const games = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Clear the user state
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const useUserGames = (userId: string | null) => {
    const [games, setGames] = useState<any[]>([]);
    // const user = getAuth().currentUser;
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      if (!userId) return;

      const gamesRef = collection(db, "games");
      const q = query(gamesRef, where("userId", "==", user.uid));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updated = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setGames(updated);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [userId])

    return { games, loading };
  }

  const handleSaveGame = async () => {
    console.log("Authenticated user ID:", user.uid);

    try {
      const newGame = {
        // name: gameName || "Untitled Game",
        name: "New Game", // Use the entered game name or a default
        // createdAt: new Date(),
        createdAt: Timestamp.fromDate(new Date()),
        board: {
          row1: ["", "", "", "", ""],
          row2: ["", "", "", "", ""],
          row3: ["", "", "", "", ""],
          row4: ["", "", "", "", ""],
          row5: ["", "", "", "", ""]
        },
        userId: user.uid
      };

      console.log(newGame);
      const gameId = await saveGame(newGame); // Save the game
      console.log("New game created with ID:", gameId);
      // setGameName(""); // Clear the input field
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const deleteGame = async (gameId: string) => {
    try {
      await deleteDoc(doc(db, "games", gameId));
      console.log(`Game ${gameId} deleted`);
    } catch (error) {
      console.error("Error deleting game:", error);
    }
  };

  const handleDelete = async (gameId: string) => {
    if (confirm("Are you sure you want to delete this game?")) {
      await deleteGame(gameId);
      // Optionally update state here to remove the deleted game from list
    }
  };

  // const newGame = {
  //   name: "Test",
  //   board: [
  //     ["C", "H", "A", "N", "T"],
  //     ["A", "E", "R", "I", "E"],
  //     ["F", "L", "I", "E", "S"],
  //     ["E", "L", "E", "C", "T"],
  //     ["S", "O", "L", "E", "S"],
  //   ]
  // }

  const newGame = {
    name: "Test",
    belongs_to: user.uid,
    board: [
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""],
      ["", "", "", "", ""]
    ]
  }

  const { games, loading } = useUserGames(user.uid);

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
      <div>
        <h2>Games</h2>
        {loading
          ? <p>Loading games...</p>
          : games.length > 0
            ? <ul>
              {games.map((game, index) => (
                <li key={game.id}>
                  <button onClick={() => handleDelete(game.id)}>Delete</button>
                  <a href={`/game/${game.id}`}>{game.name}</a>
                </li>
              ))}
            </ul>
            : <p>No games found</p>
        }
        <button onClick={handleSaveGame}>Create Game</button>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default LandingPage;