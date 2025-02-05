import { Outlet } from "react-router";
import { UserProvider } from "../Context/userContext";
import DashboardLayout from "./Dashboard";

const Home = () => {
  return (
    <div>
      <UserProvider>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </UserProvider>
    </div>
  );
};

export default Home;
