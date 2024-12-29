import { useState } from "react";
import { Outlet } from "react-router";
import { User, UserContext } from "../Context/userContext";
import Footer from "./Footer";
import Header from "./Header";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <div>
      <UserContext.Provider value={{ user, setUser }}>
        <Header />
        <Outlet />
        <Footer />
      </UserContext.Provider>
    </div>
  );
};

export default Home;
