import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../../firebase/firebase";
import "./styles.css";
import Keyboard from "../../components/Keyboard";

interface SquareProps {
  id: string;
  letter: string;
  selected: boolean;
  black: boolean;
  highlighted: boolean;
  onClick: React.MouseEventHandler<SVGSVGElement>;
  // onFocus: React.FocusEventHandler<SVGSVGElement>;
  onFocus: (event: FocusEvent) => void;
  onKeyDown: React.KeyboardEventHandler<SVGSVGElement>;
  wordIndex?: number;
}

const GamePage = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [game, setGame] = useState<any>(null);
  const [starts, setStarts] = useState<{}>({});

  const [selectedSquare, setSelectedSquare] = useState<string>("");
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");

  const [gameBoard, setGameBoard] = useState([
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
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

  const toggleBlack = (box) => {
    console.log(box)
    const row = parseInt(box.split("-")[2]);
    const column = parseInt(box.split("-")[1]);
    setGameBoard((prevBoard) => {
      const newBoard = prevBoard.map(row => [...row]);
      if (newBoard[row][column] === "BLACK") {
        newBoard[row][column] = "";
      } else {
        newBoard[row][column] = "BLACK";
      }
      return newBoard;
    });
  }

  const calculateStarts = (gameBoard) => {
    const starts = {};
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < gameBoard[col].length; row++) {
        if (gameBoard[col][row] === "BLACK") continue;
        if ((row === 0 || row > 0 && gameBoard[col][row - 1] === "BLACK")
          || (col === 0 || col > 0 && gameBoard[col - 1][row] === "BLACK")) {
          starts[`box-${col}-${row}`] = {
            index: Object.keys(starts).length + 1,
            direction: col === 0 ? "vertical" : "horizontal"
          }
          
        }
      }
    }

    console.log(starts);
    return starts;
  }

  const handleInnerWidth = () => {
    const firstKey = document.querySelector('.top button');

    const fallback = (Math.min(500, window.innerWidth) - 66) / 10;
    const keyWidth = firstKey ? firstKey.offsetWidth : fallback;

    const newWidth = `${keyWidth}px`;
    document.documentElement.style.setProperty('--key-width', newWidth);

    const boxWidth = `${(Math.min(500, window.innerWidth - 12)) / 5}px`;
    document.documentElement.style.setProperty('--box-width', boxWidth);
  };

  const showWords = () => {
    const words = { horizontal: {}, vertical: {} };
    for (let col = 0; col < 5; col++) {
      if (starts[`box-${col}-0`]) {
        let word = "";
        let boxes = [];
        for (let row = 0; row < 5; row++) {
          if (gameBoard[row][col] !== "BLACK") {
            word += gameBoard[row][col];
            boxes.push(`box-${col}-${row}`)
          }
        }
        words.vertical[starts[`box-${col}-0`].index] = {
          word,
          boxes
        }
      }
    }
    for (let row = 0; row < 5; row++) {
      if (starts[`box-0-${row}`]) {
        let word = "";
        let boxes = [];
        for (let col = 0; col < 5; col++) {
          if (gameBoard[row][col] !== "BLACK") {
            word += gameBoard[row][col];
            boxes.push(`box-${col}-${row}`)
          }
        }
        if(!words.vertical[starts[`box-0-${row}`].index])
        words.horizontal[starts[`box-0-${row}`].index] = {
          word,
          boxes
        }
      }
    }

    console.log(words)
  }

  const handleUpdateGame = async () => {
    const gameId = window.location.pathname.split("/")[2]
    try {
      const gameRef = doc(db, "games", gameId);

      await updateDoc(gameRef, {
        board: {
          0: gameBoard[0],
          1: gameBoard[1],
          2: gameBoard[2],
          3: gameBoard[3],
          4: gameBoard[4],
        },
        updatedAt: Timestamp.fromDate(new Date())
      });

      console.log("Game updated successfully!");
    } catch (error) {
      console.error("Error updating game:", error);
    }
  };

  useEffect(() => {
    const gameId = window.location.pathname.split("/")[2];
    console.log(gameId);
    fetchGame(gameId);
  }, [])

  useEffect(() => {
    setStarts(calculateStarts(gameBoard));
  }, [gameBoard]);

  useEffect(() => {
    handleInnerWidth();
    window.addEventListener('resize', handleInnerWidth);

    return () => {
      document.documentElement.style.removeProperty('--key-width');
      window.removeEventListener('resize', handleInnerWidth);
    };
  }, []);


  const Square = ({
    black,
    selected,
    highlighted,
    id,
    onClick,
    onFocus,
    onKeyDown,
    letter,
    wordIndex,
  }: SquareProps) => {
    const getColor = () => {
      if (black) return "black";
      if (selected) return "yellow";
      if (highlighted) return "lightblue"
      return "white";
    }

    return (
      <svg
        className="game-box"
        // width={(Math.min(500, window.innerWidth - 12)) / 5}
        // height={(Math.min(500, window.innerWidth - 12)) / 5}
        // width="var(--box-width)"
        // height="var(--box-width)"
        id={id}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        tabIndex={black ? -1 : 0}
      >
        <g>
          <rect
            fill={getColor()}
            width="100%"
            height="100%"
            strokeWidth={0}
            stroke="none">
          </rect>
          {wordIndex > 0 && <text x="5%" y="25%" textAnchor="start" fontSize="20">{wordIndex}</text>}
          {!black && <text x="50%" y="70%" textAnchor="middle" fontSize="48" data-testid={id}>{letter}</text>}
        </g>
      </svg>
    )
  }

  const handleClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const target = event.currentTarget;
    const id = target.id;

    const stringRegex = /^box-\d-\d$/;
    if(!id.match(stringRegex)) return;

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
      const nextBox = "box-" + column + "-" + (row - 1)
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
    const row = parseInt(selectedSquare.split("-")[2]);
    const column = parseInt(selectedSquare.split("-")[1]);

    const newGameBoard = [...gameBoard]

    if(newGameBoard[row][column] === "BLACK") return;

    if (key === "SPACE") setDirection(direction === "horizontal"
      ? "vertical"
      : "horizontal"
    );

    if (key === "ARROWRIGHT") moveRight(row, column);
    if (key === "ARROWLEFT") moveLeft(row, column);
    if (key === "ARROWUP") moveUp(row, column);
    if (key === "ARROWDOWN") moveDown(row, column);

    if (key === "BACKSPACE") {
      if (newGameBoard[row][column] !== "") {
        newGameBoard[row][column] = "";
      } else {
        if (direction === "horizontal") {
          moveLeft(row, column);
          newGameBoard[row][column - 1] = "";
        } else if (direction === "vertical") {
          moveUp(row, column);
          newGameBoard[row - 1][column] = "";
        } else {
          return;
        }
      }
      setGameBoard([...newGameBoard]);
    } else {
      if (!key.match(/^KEY[A-Z]$/g) && !key.match(/^[A-Z]$/g)) return;
      newGameBoard[row][column] = key[key.length - 1];
      setGameBoard([...newGameBoard]);
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

  const handleFocusChange = (event: FocusEvent) => {
    const active = document.activeElement;
    const stringRegex = /^box-\d-\d$/;
    if(!active.id.match(stringRegex)) return;
    setSelectedSquare(active.id);
  };

  return (
    !loading && game && <div className="game-interface">
      <div className="crossword-board-container">
        <div className="crossword-board">
          {Array.from({ length: 25 }, (_, index) => (
            <Square
              black={gameBoard[Math.floor(index / 5)][index % 5] === "BLACK"}
              selected={selectedSquare === `box-${index % 5}-${Math.floor(index / 5)}`}
              highlighted={(() => {
                const col = parseInt(selectedSquare.split("-")[2])
                const row = parseInt(selectedSquare.split("-")[1])
                if(row >= 0 && col >= 0 && gameBoard[col][row] === "BLACK") return false;
                return direction === "horizontal"
                ? Math.floor(index / 5) === col
                : index % 5 === row
              })()}
              id={`box-${index % 5}-${Math.floor(index / 5)}`}
              data-index={index}
              data-x={index % 5}
              data-y={Math.floor(index / 5)}
              onClick={handleClick}
              onFocus={handleFocusChange}
              onKeyDown={(e) => handleKeyPress(e.code.toUpperCase())}
              letter={gameBoard[Math.floor(index / 5)][index % 5]}
              wordIndex={starts[`box-${Math.floor(index / 5)}-${index % 5}`]?.index
                || 0}
              key={index}
            />
          ))}
        </div>
      </div>
      <div>
        <button onClick={() => showWords()}>Show Words</button>
        <button onClick={() => calculateStarts(gameBoard)}>Calculate Starts</button>
        <button
          disabled={
            selectedSquare !== "box-0-0" &&
            selectedSquare !== "box-0-4" &&
            selectedSquare !== "box-4-0" &&
            selectedSquare !== "box-4-4"
          }
          onClick={() => toggleBlack(selectedSquare)}
        >Make Black
        </button>
        <button onClick={handleUpdateGame}>Update Game</button>
      </div>
      <div className="keyboard-container" ref={keyboardRef}>
        <Keyboard handleKeyPress={handleKeyPress} />
      </div>
    </div>
  )
}

export default GamePage;