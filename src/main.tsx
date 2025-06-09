import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AboutUs from './Components/AboutUs.tsx'
import AddProduct from './Components/AddProduct.tsx'
import AddWallet from './Components/AddWallet.tsx'
import AdminOrders from './Components/AdminOrders.tsx'
import AdminProducts from './Components/AdminProducts.tsx'
import AdminTransactionHistory from './Components/AdminTransactionHistory.tsx'
import AdminWalletManagement from './Components/AdminWallet.tsx'
import AdminWithdrawRequests from './Components/AdminWithdrawRequest.tsx'
import BalanceStatement from './Components/BalanceStatement.tsx'
import Cart from './Components/Cart.tsx'
import CatchAllRoute from './Components/CatchAllRoutes.tsx'
import ChangePasswordPage from './Components/ChangePassword.tsx'
import Checkout from './Components/Checkout.tsx'
import FAQSection from './Components/FAQ.tsx'
import Favorites from './Components/Favorites.tsx'
import Home from './Components/Home.tsx'
import LandingPage from './Components/LandingPage.tsx'
import LoginPage from './Components/Login.tsx'
import Orders from './Components/Orders.tsx'
import PasswordReset from './Components/PasswordReset.tsx'
import ProductDetailDecider from './Components/ProductDetailDecider.tsx'
import PublicProductDetails from './Components/ProductDetailPublic.tsx'
import Products from './Components/Products.tsx'
import Profile from './Components/Profile.tsx'
import Referral from './Components/Refferal.tsx'
import Register from './Components/Register.tsx'
import SalesGuidelines from './Components/SalesGuideline.tsx'
import SellerHomeDashboard from './Components/SellersAdminDashboard.tsx'
import SupportCenter from './Components/SupportCenter.tsx'
import SupportTicket from './Components/SupportTicket.tsx'
import OrderTracking from './Components/Tracking.tsx'
import WithdrawHistory from './Components/WithdrawHistory.tsx'
import WithdrawRequest from './Components/WithdrawRequest.tsx'
import { UserProvider } from './Context/userContext.tsx'
import { useAuth } from './Hooks/useAuth.tsx'
import './index.css'

import * as Sentry from '@sentry/react'
import AdminDashboard from './Components/AdminDashboard.tsx'
import AdminPaymentVerification from './Components/AdminPaymentVerification.tsx'
import CustomerRegister from './Components/CustomerRegister.tsx'
import ResellerPassiveIncome from './Components/PassiveIncome.tsx'
import PayDue from './Components/PayDue.tsx'
import PaymentHistory from './Components/PaymentHistory.tsx'
import PrivacyPolicy from './Components/PrivacyPolicy.tsx'
import RefundPolicy from './Components/RefundPolicy.tsx'
import SellerDashboard from './Components/SellerDashboard.tsx'
import SettingsPanel from './Components/SettingPanel.tsx'
import TermsAndConditions from './Components/TermsAndConditions.tsx'

Sentry.init({
  dsn: 'https://283a749ae1d929c3da86a952b8290e15@o4509187069378560.ingest.de.sentry.io/4509187074359376',
})

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  // const location = useLocation();

  if (user) {
    const role = user.role

    const from = role === 'Seller' ? '/home' : '/profile'

    return <Navigate to={from} replace />
  }

  return children
}
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    // Redirect to login page while preserving the current location
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return children
}
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (user.role !== 'Admin') {
    return <Navigate to='/not-authorized' replace />
  }

  return children
}
const SellerRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (user.role !== 'Seller') {
    return <Navigate to='/not-authorized' replace />
  }

  return children
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}>
            <Route
              index
              element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              }
            />
            <Route
              path='about-us'
              element={
                <PublicRoute>
                  <AboutUs />
                </PublicRoute>
              }
            />
            <Route path='passive-income' element={<ResellerPassiveIncome />} />

            <Route
              path='privacy-policy'
              element={
                <PublicRoute>
                  <PrivacyPolicy />
                </PublicRoute>
              }
            />
            <Route
              path='terms-conditions'
              element={
                <PublicRoute>
                  <TermsAndConditions />
                </PublicRoute>
              }
            />
            <Route
              path='return-refund-policy'
              element={
                <PublicRoute>
                  <RefundPolicy />
                </PublicRoute>
              }
            />
            <Route
              path='home'
              element={
                <SellerRoute>
                  <SellerHomeDashboard />
                </SellerRoute>
              }
            />
            <Route
              path='admin-dashboard'
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path='settings'
              element={
                <AdminRoute>
                  <SettingsPanel />
                </AdminRoute>
              }
            />
            <Route
              path='pay-due'
              element={
                <SellerRoute>
                  <PayDue />
                </SellerRoute>
              }
            />
            <Route
              path='seller-dashboard'
              element={
                <SellerRoute>
                  <SellerDashboard />
                </SellerRoute>
              }
            />
            <Route path='product-detail/:productId' element={<PublicProductDetails />} />
            <Route path='products' element={<Products />} />
            <Route path='products/:productId' element={<ProductDetailDecider />} />
            <Route
              path='cart'
              element={
                <SellerRoute>
                  <Cart />
                </SellerRoute>
              }
            />
            <Route path='support' element={<SupportCenter />} />
            <Route
              path='selling-guide'
              element={
                <SellerRoute>
                  <SalesGuidelines />
                </SellerRoute>
              }
            />
            <Route path='faq' element={<FAQSection />} />
            <Route
              path='support-ticket'
              element={
                <SellerRoute>
                  <SupportTicket />
                </SellerRoute>
              }
            />
            <Route
              path='favorites'
              element={
                <SellerRoute>
                  <Favorites />
                </SellerRoute>
              }
            />
            <Route
              path='add-wallet'
              element={
                <SellerRoute>
                  <AddWallet />
                </SellerRoute>
              }
            />
            <Route
              path='add-admin-wallets'
              element={
                <AdminRoute>
                  <AdminWalletManagement />
                </AdminRoute>
              }
            />
            <Route
              path='request-withdraw'
              element={
                <SellerRoute>
                  <WithdrawRequest />
                </SellerRoute>
              }
            />
            <Route
              path='balance-statement'
              element={
                <SellerRoute>
                  <BalanceStatement />
                </SellerRoute>
              }
            />
            <Route
              path='transactions-history'
              element={
                <AdminRoute>
                  <AdminTransactionHistory />
                </AdminRoute>
              }
            />

            <Route
              path='admin-withdraw-request'
              element={
                <AdminRoute>
                  <AdminWithdrawRequests />
                </AdminRoute>
              }
            />
            <Route
              path='admin-orders'
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            <Route
              path='withdraw-history'
              element={
                <SellerRoute>
                  <WithdrawHistory />
                </SellerRoute>
              }
            />
            <Route
              path='payment-history'
              element={
                <SellerRoute>
                  <PaymentHistory />
                </SellerRoute>
              }
            />
            <Route
              path='payment-verification'
              element={
                <AdminRoute>
                  <AdminPaymentVerification />
                </AdminRoute>
              }
            />
            <Route
              path='checkout'
              element={
                <SellerRoute>
                  <Checkout />
                </SellerRoute>
              }
            />
            <Route
              path='register'
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path='customer-register'
              element={
                <PublicRoute>
                  <CustomerRegister />
                </PublicRoute>
              }
            />
            <Route
              path='login'
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path='forgot-password'
              element={
                <PublicRoute>
                  <PasswordReset />
                </PublicRoute>
              }
            />
            <Route
              path='profile'
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path='tracking'
              element={
                <PrivateRoute>
                  <OrderTracking />
                </PrivateRoute>
              }
            />
            <Route
              path='add-referral-code'
              element={
                <SellerRoute>
                  <Referral />
                </SellerRoute>
              }
            />

            <Route
              path='add-product'
              element={
                <AdminRoute>
                  <AddProduct />
                </AdminRoute>
              }
            />
            <Route
              path='admin-products'
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />
            <Route
              path='orders'
              element={
                <SellerRoute>
                  <Orders />
                </SellerRoute>
              }
            />
            <Route
              path='change-password'
              element={
                <PrivateRoute>
                  <ChangePasswordPage />
                </PrivateRoute>
              }
            />
            <Route path='*' element={<CatchAllRoute />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </StrictMode>
)
