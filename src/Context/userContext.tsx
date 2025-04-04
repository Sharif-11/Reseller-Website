import { createContext, ReactNode, useEffect, useState } from "react";
import { verifyLogin } from "../Api/auth.api";
import Loading from "../Components/Loading";

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
  balance: number;
  shopName?: string | null;
  nomineePhone?: string | null;
  role: "Seller" | "Admin";
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  error: Error | null;
}

// Create the context
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  error: null
});

// Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const checkLogin = async () => {
    if(user) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await verifyLogin();
      
      if (result?.success) {
        setUser(result.data?.user || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Login verification failed:", error);
      setError(error instanceof Error ? error : new Error('Login verification failed'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    checkLogin();
  }, []);
 if(loading) return <Loading />;
  return (
    <UserContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

