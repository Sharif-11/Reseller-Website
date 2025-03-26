import { Outlet } from "react-router-dom";
import DashboardLayout from "./Dashboard";

const Home = () => {
  return (
    <div>
    
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
     
    </div>
  );
};

export default Home;
