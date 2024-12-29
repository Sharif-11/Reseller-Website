import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./Components/Home.tsx";
import LoginPage from "./Components/Login.tsx";
import PasswordReset from "./Components/PasswordReset.tsx";
import ProductsPage from "./Components/Products.tsx";
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
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
