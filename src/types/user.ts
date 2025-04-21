import { ReactElement } from "react";

interface Achievement {
  id: string,
  name: string,
  description: string,
  date: Date,
  icon: ReactElement
}

export interface User {
  uid: string,
  name: string,
  phone: string,
  createdAt: Date,
  achivements: Achievement[],
}