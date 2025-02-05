import { createContext, ReactNode, useState } from "react";

export interface User {
  userId: string;
  phoneNo: string;
  name: string;
  zilla: string;
  upazilla: string;
  address: string;
  referralCode?: string | null;
  email?: string | null;
  isVerified: boolean;
  balance: number; // Converted Decimal to number
  shopName?: string | null;
  nomineePhone?: string | null;
  role: "Seller" | "Admin" | "Buyer"; // Assuming Role is an enum
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Create the context
export const UserContext = createContext<UserContextType | null>(null);

// Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
