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
import Cart from "./Components/Cart.tsx";
import Favorites from "./Components/Favorites.tsx";
import AddWallet from "./Components/AddWallet.tsx";
import WithdrawRequest from "./Components/WithdrawRequest.tsx";
import WithdrawHistory from "./Components/WithdrawHistory.tsx";
import AdminWithdrawRequests from "./Components/AdminWithdrawRequest.tsx";
import BalanceStatement from "./Components/BalanceStatement.tsx";
import AdminTransactionHistory from "./Components/AdminTransactionHistory.tsx";
import Checkout from "./Components/Checkout.tsx";
import AdminWalletManagement from "./Components/AdminWallet.tsx";
import LandingPage from "./Components/LandingPage.tsx";
import PublicProductDetails from "./Components/ProductDetailPublic.tsx";
import ProductDetailDecider from "./Components/ProductDetailDecider.tsx";
import SellerHomeDashboard from "./Components/SellersAdminDashboard.tsx";
import SupportCenter from "./Components/SupportCenter.tsx";
import FAQSection from "./Components/FAQ.tsx";
import SupportTicket from "./Components/SupportTicket.tsx";



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
          <Route index element={<LandingPage/>} />
          <Route path="home" element={<SellerRoute><SellerHomeDashboard/></SellerRoute>} />
          <Route path='product-detail/:productId' element={<PublicProductDetails/>} />
          <Route path='products' element={
           
              <Products/>
       
           } />
          <Route path='products/:productId' element={
           
              <ProductDetailDecider/>
            
           } />
          <Route path='cart' element={
            <SellerRoute>
              <Cart/>
            </SellerRoute>
           } />
          <Route path='support' element={
            <SellerRoute>
              <SupportCenter/>
            </SellerRoute>
           } />
          <Route path='faq' element={
            <SellerRoute>
              <FAQSection/>
            </SellerRoute>
           } />
          <Route path='support-ticket' element={
            <SellerRoute>
              <SupportTicket/>
            </SellerRoute>
           } />
          <Route path='favorites' element={
            <SellerRoute>
              <Favorites/>
            </SellerRoute>
           } />
          <Route path='add-wallet' element={
            <SellerRoute>
              <AddWallet/>
            </SellerRoute>
           } />
          <Route path='add-admin-wallets' element={
            <AdminRoute>
              <AdminWalletManagement/>
            </AdminRoute>
           } />
          <Route path='request-withdraw' element={
            <SellerRoute>
            <WithdrawRequest/>
            </SellerRoute>} />
          <Route path='balance-statement' element={
            <SellerRoute>
           <BalanceStatement/>
            </SellerRoute>} />
          <Route path='transactions-history' element={
            <AdminRoute>
             <AdminTransactionHistory/>
            </AdminRoute>} /> 



          <Route path='admin-withdraw-request' element={
            <AdminRoute>
              <AdminWithdrawRequests/>
            </AdminRoute>
          } />
          <Route path='withdraw-history' element={
            <SellerRoute>
              <WithdrawHistory/>
            </SellerRoute>
           
          } />
          <Route path='checkout' element={
            <SellerRoute>
            <Checkout/>
            </SellerRoute>
           
          } />
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
