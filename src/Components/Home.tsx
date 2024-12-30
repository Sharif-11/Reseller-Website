import { useState } from "react";
import { Outlet } from "react-router";
import { User, UserContext } from "../Context/userContext";
import DashboardLayout from "./Dashboard";

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <div>
      <UserContext.Provider value={{ user, setUser }}>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </UserContext.Provider>
    </div>
  );
};

export default Home;
