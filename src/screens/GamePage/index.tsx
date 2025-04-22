import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase/firebase";

const GamePage = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [game, setGame] = useState<any>(null);

  const fetchGame = async (game) => {
    setLoading(true);
    try {
      const gameDocRef = doc(db, "games", game.id);
      const gameDoc = await getDoc(gameDocRef);

      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        console.log("Game data fetched successfully:", gameData);
        setGame(gameData);
      } else {
        setGame(null);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
  }


  return (
    <div>GamePage</div>
  )
}

export default GamePage;