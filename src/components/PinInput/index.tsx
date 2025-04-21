import React, { useRef, useState } from "react";
import "./styles.css";

interface PinInputProps {
  setValue: React.Dispatch<React.SetStateAction<string>>;
  length?: number;
}

const PinInput = ({ setValue, length = 6 }: PinInputProps) => {
  const [pin, setPin] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const moveFocus = (index: number, direction: 1 | 0 | -1) => {
    const nextIndex = index + direction;
    if (nextIndex >= 0 && nextIndex < length) {
      inputRefs.current[nextIndex]?.focus();
      inputRefs.current[nextIndex]?.select();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (newValue.length === 1) {
      const newPin = [...pin];
      newPin[index] = newValue;
      setPin(newPin);
      setValue(newPin.join(""));
      moveFocus(index, 1); // Move to the next box
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const isNumber = /^[0-9]$/.test(e.key);

    if (isNumber) {
      e.preventDefault();
      const newPin = [...pin];
      newPin[index] = e.key;
      setPin(newPin);
      setValue(newPin.join(""));
      moveFocus(index, 1);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      const newPin = [...pin];
      if (pin[index]) {
        newPin[index] = "";
      } else {
        moveFocus(index, -1);
        newPin[index - 1] = "";
      }
      setPin(newPin);
      setValue(newPin.join(""));
    }
  };

  return (
    <div className="pin-input">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          className="pin-input-box"
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onClick={() => moveFocus(index, 0)}
        />
      ))}
    </div>
  );
};

export default PinInput;