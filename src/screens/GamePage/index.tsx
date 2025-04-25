import { doc, getDoc } from "firebase/firestore";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { db } from "../../firebase/firebase";
import "./styles.css";
import Keyboard from "../../components/Keyboard";

interface SquareProps {
  id: string;
  letter: string;
  selected: boolean;
  highlighted: boolean;
  onClick: React.MouseEventHandler<SVGSVGElement>;
  onKeyDown: React.KeyboardEventHandler<SVGSVGElement>;
  wordIndex?: number;
}

const GamePage = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [game, setGame] = useState<any>(null);
  const [widths, setWidths] = useState<{
    innerWidth: number,
    keyWidth: number
  }>({
    innerWidth: window.innerWidth,
    keyWidth: 0
  });

  // const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");

  const [gameBoard, setGameBoard] = useState([
  ])

  const keyboardRef = useRef<HTMLDivElement | null>(null);

  const fetchGame = async (gameId) => {
    setLoading(true);
    try {
      const gameDocRef = doc(db, "games", gameId);
      const gameDoc = await getDoc(gameDocRef);

      if (gameDoc.exists()) {
        const gameData = gameDoc.data();
        console.log("Game data fetched successfully:", gameData);
        setGame(gameData);
        setGameBoard([
          gameData.board[0],
          gameData.board[1],
          gameData.board[2],
          gameData.board[3],
          gameData.board[4]
        ])
      } else {
        setGame(null);
      }
    } catch (error) {
      console.error("Error fetching game data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const gameId = window.location.pathname.split("/")[2];
    console.log(gameId);
    fetchGame(gameId);
  }, [])

  const handleInnerWidth = () => {
    const firstKey = document.querySelector('.top button');

    const fallback = (Math.min(500, window.innerWidth) - 66) / 10;
    const keyWidth = firstKey ? firstKey.offsetWidth : fallback;

    setWidths({ innerWidth: window.innerWidth, keyWidth });

    const newWidth = `${keyWidth}px`;
    document.documentElement.style.setProperty('--key-width', newWidth);

    console.log("Set key width:", newWidth);
  };

  useEffect(() => {

    handleInnerWidth();

    window.addEventListener('resize', handleInnerWidth);

    return () => {
      document.documentElement.style.removeProperty('--key-width');
      window.removeEventListener('resize', handleInnerWidth);
    };
  }, []);


  const Square = ({
    selected,
    highlighted,
    id,
    onClick,
    onKeyDown,
    letter,
    wordIndex,
  }: SquareProps) => {
    return (
      <svg
        width={(Math.min(500, innerWidth - 12)) / 5}
        height={(Math.min(500, innerWidth - 12)) / 5}
        id={id}
        onClick={onClick}
        onKeyDown={onKeyDown}
        // tabIndex={selected ? 0 : -1}
        tabIndex={0}
      >
        <g>
          <rect
            fill={selected
              ? "yellow"
              : highlighted
                ? "lightblue"
                : "white"
            }
            width="100%"
            height="100%"
            strokeWidth={0}
            stroke="none">
          </rect>
          {wordIndex > 0 && <text x="5%" y="25%" textAnchor="start" fontSize="20">{wordIndex}</text>}
          <text x="50%" y="70%" textAnchor="middle" fontSize="48" data-testid={id}>{letter}</text>
        </g>
      </svg>
    )
  }

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const target = event.currentTarget;
    const id = target.id;

    console.log("clicked:", id)

    if (selectedSquare === id) {
      setDirection(direction === "horizontal" ? "vertical" : "horizontal");
    } else {
      setSelectedSquare(id);
    }
  }

  const moveLeft = (row, column) => {
    if (column > 0) {
      const nextBox = "box-" + (column - 1) + "-" + row;
      setSelectedSquare(nextBox);
    }
  }

  const moveRight = (row, column) => {
    if (column < 4) {
      const nextBox = "box-" + (column + 1) + "-" + row;
      setSelectedSquare(nextBox);
    }
  }

  const moveUp = (row, column) => {
    if (row > 0) {
      const nextBox = "box-" + column + "-" + (row - 1);
      setSelectedSquare(nextBox);
    }
  }

  const moveDown = (row, column) => {
    if (row < 4) {
      const nextBox = "box-" + column + "-" + (row + 1);
      setSelectedSquare(nextBox);
    }
  }

  const handleKeyPress = (key: string) => {
    const target = document.getElementById(selectedSquare);
    const row = parseInt(selectedSquare.split("-")[2]);
    const column = parseInt(selectedSquare.split("-")[1]);
    const text = target.querySelector("text[data-testid]");

    if (key === "SPACE") {
      setDirection(direction === "horizontal" ? "vertical" : "horizontal");
      return;
    }

    if (key === "ARROWRIGHT") {
      moveRight(row, column);
    }

    if (key === "ARROWLEFT") {
      moveLeft(row, column);
    }

    if (key === "ARROWUP") {
      moveUp(row, column);
    }

    if (key === "ARROWDOWN") {
      moveDown(row, column);
    }

    if (key === "BACKSPACE") {
      // text.textContent = "";
      if (gameBoard[row][column] !== "") {
        gameBoard[row][column] = "";
      } else {
        if (direction === "horizontal") {
          moveLeft(row, column);
          gameBoard[row][column - 1] = "";
        } else if (direction === "vertical") {
          moveUp(row, column);
          gameBoard[row - 1][column] = "";
        } else {
          return;
        }
      }
      setGameBoard([...gameBoard]);
    } else {
      if (!key.match(/^KEY[A-Z]$/)) return;
      gameBoard[row][column] = key[key.length - 1];
      setGameBoard([...gameBoard]);
      console.log(direction)
      // text.textContent = key;
      if (direction === "horizontal") {
        moveRight(row, column);
      } else if (direction === "vertical") {
        moveDown(row, column);
      } else {
        return;
      }
    }
  }

  useEffect(() => {
    const el = document.getElementById(selectedSquare);
    if (el) el.focus();
  }, [handleClick, selectedSquare]);

  return (
    !loading && game && <div className="game-interface">
      <div className="crossword-board-container">
        <div className="crossword-board">
          {Array.from({ length: 25 }, (_, index) => (
            <Square
              selected={selectedSquare === `box-${index % 5}-${Math.floor(index / 5)}`}
              highlighted={direction === "horizontal"
                ? Math.floor(index / 5) === parseInt(selectedSquare.split("-")[2])
                : index % 5 === parseInt(selectedSquare.split("-")[1])
              }
              id={`box-${index % 5}-${Math.floor(index / 5)}`}
              data-index={index}
              data-x={index % 5}
              data-y={Math.floor(index / 5)}
              onClick={handleClick}
              onKeyDown={(e) => handleKeyPress(e.code.toUpperCase())}
              letter={gameBoard[Math.floor(index / 5)][index % 5]}
              wordIndex={index < 5 ? index + 1 : index % 5 === 0 ? index / 5 + 1 : 0} key={index}
            />
          ))}
        </div>
      </div>
      <div className="keyboard-container" ref={keyboardRef}>
        <Keyboard handleKeyPress={handleKeyPress} />
      </div>
    </div>
  )
}

export default GamePage;