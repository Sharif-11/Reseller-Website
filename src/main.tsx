import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AddProduct from "./Components/AddProduct.tsx";
import ChangePasswordPage from "./Components/ChangePassword.tsx";
import Home from "./Components/Home.tsx";
import LoginPage from "./Components/Login.tsx";
import Orders from "./Components/Orders.tsx";
import PasswordReset from "./Components/PasswordReset.tsx";
import Profile from "./Components/Profile.tsx";
import Referral from "./Components/Refferal.tsx";
import Register from "./Components/Register.tsx";
import "./index.css";
import { useAuth } from "./Hooks/useAuth.tsx";
import { Navigate, Route, Routes,BrowserRouter, useLocation} from "react-router-dom";
import { UserProvider } from "./Context/userContext.tsx";
import AdminProducts from "./Components/AdminProducts.tsx";
import CatchAllRoute from "./Components/CatchAllRoutes.tsx";
import Products from "./Components/Products.tsx";
import ProductDetail from "./Components/ProductDetail.tsx";



const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    // If user is logged in, check if they were redirected from another route
    const from = location.state?.from?.pathname || "/profile";
    return <Navigate to={from} replace />;
  }

  return children;
};
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Redirect to login page while preserving the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'Admin') {
    return <Navigate to="/not-authorized" replace />
  }

  return children
}
const SellerRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'Seller') {
    return <Navigate to="/not-authorized" replace />
  }

  return children
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Products/>} />
          <Route path='products' element={<Products/> } />
          <Route path='products/:productId' element={<ProductDetail/> } />
          <Route path="register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="forgot-password" element={
            <PublicRoute>
              <PasswordReset />
            </PublicRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="add-referral-code" element={
            <SellerRoute>
              <Referral />
            </SellerRoute>

          } />
          <Route path="add-product" element={
            <AdminRoute>
              <AddProduct />
            </AdminRoute>
          } />
          <Route path="admin-products" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
          <Route path="orders" element={
            <SellerRoute>
              <Orders />
            </SellerRoute>
          } />
          <Route path="change-password" element={
            <PrivateRoute>
              <ChangePasswordPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<CatchAllRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </UserProvider>
  </StrictMode>
);
