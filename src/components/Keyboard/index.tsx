import { useRef } from "react";
import "./styles.css";

interface KeyboardProps {
  handleKeyPress: (key: string) => void;
}

const Keyboard = ({ handleKeyPress }) => {
  const letterRegex = /^[A-Z]$/;
  const isLetter = (key: string) => {
    return letterRegex.test(key);
  }

  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ]

  return (
    <div className="keyboard">
      {rows.map((row, rowIndex) => (
        <div className={`keyboard-row${rowIndex === 0 ? " top" : ""}`} key={rowIndex}>
          {row.map((key, keyIndex) => (
            key !== ""
              ? <button
                onClick={() => handleKeyPress(key)}
                className={`key${isLetter(key) ? "" : key === "BACKSPACE" ? " backspace" : ""}`}
                key={keyIndex}
              >
                {isLetter(key) ? key : key === "BACKSPACE" ? <span>&#9003;</span> : ""}
              </button>
              : <div className="blank"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default Keyboard;