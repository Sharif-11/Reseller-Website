import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import ChangePasswordPage from "./Components/ChangePassword.tsx";
import Home from "./Components/Home.tsx";
import LoginPage from "./Components/Login.tsx";
import Orders from "./Components/Orders.tsx";
import PasswordReset from "./Components/PasswordReset.tsx";
import ProductsPage from "./Components/Products.tsx";
import Profile from "./Components/Profile.tsx";
import Register from "./Components/Register.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<ProductsPage />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="forgot-password" element={<PasswordReset />} />
          <Route path="profile" element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
