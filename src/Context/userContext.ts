import { createContext } from "react";

export interface User {
  mobileNo: string;
  email?: string;
  name: string;
  zilla: string;
  address: string;
  sellerCode?: string;
  shopName?: string;
}
interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}
// Create the context with a default value
export const UserContext = createContext<UserContextType | null>(null);
