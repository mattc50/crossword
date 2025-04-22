import { Timestamp } from "firebase/firestore";
import { ReactElement } from "react";

interface Achievement {
  id: string,
  name: string,
  description: string,
  date: Timestamp,
  icon: ReactElement
}

/**
 * Comprises a matrix of strings representing the game board.
 * Ex:
 * ["x", "o", "x", "o", "x"],
 * ["o", "x", "o", "x", "o"],
 * ["x", "o", "x", "o", "x"],
 * ["o", "x", "o", "x", "o"],
 * ["x", "o", "x", "o", "x"]
 */
interface Row {
  row: string[]
}

export interface Game {
  id: string,
  name: string,
  belongs_to: string,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  board: Row[]
  achievements: Achievement[],
}

export interface User {
  uid: string,
  name: string,
  phone: string,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  games: Game[],
  achievements: Achievement[],
}