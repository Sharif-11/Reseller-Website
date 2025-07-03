import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AboutUs from './Components/AboutUs.tsx'
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
import PublicProductDetails from './Components/ProductDetailPublic.tsx'
import Products from './Components/Products.tsx'
import Profile from './Components/Profile.tsx'
import Referral from './Components/Refferal.tsx'
import Register from './Components/Register.tsx'
import SalesGuidelines from './Components/SalesGuideline.tsx'
import SellerHomeDashboard from './Components/SellersAdminDashboard.tsx'
import SupportCenter from './Components/SupportCenter.tsx'
import SupportTicket from './Components/SupportTicket.tsx'
import WithdrawHistory from './Components/WithdrawHistory.tsx'
import WithdrawRequest from './Components/WithdrawRequest.tsx'
import { UserProvider } from './Context/userContext.tsx'
import { useAuth } from './Hooks/useAuth.tsx'
import './index.css'

import * as Sentry from '@sentry/react'
import AddWallet from './Components/AddWallet.tsx'
import CustomerCheckout from './Components/CustomerCheckout.tsx'
import CustomerOrders from './Components/CustomerOrders.tsx'
import CustomerRegister from './Components/CustomerRegister.tsx'
import ResellerPassiveIncome from './Components/PassiveIncome.tsx'
import PayDue from './Components/PayDue.tsx'
import PaymentHistory from './Components/PaymentHistory.tsx'
import PrivacyPolicy from './Components/PrivacyPolicy.tsx'
import ProductDetail from './Components/ProductDetail.tsx'
import RefundPolicy from './Components/RefundPolicy.tsx'
import SellerDashboard from './Components/SellerDashboard.tsx'
import TermsAndConditions from './Components/TermsAndConditions.tsx'
import { CartFavoriteProvider } from './Context/cartContext.tsx'

Sentry.init({
  dsn: 'https://283a749ae1d929c3da86a952b8290e15@o4509187069378560.ingest.de.sentry.io/4509187074359376',
})

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()
  let pathname = location?.state?.from?.pathname
  pathname = pathname === '/checkout' || pathname === '/customer-checkout' ? '/cart' : pathname

  if (user) {
    return <Navigate to={pathname || '/home'} replace />
  }

  return children
}

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to='/login' state={{ from: location }} replace />
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
const CommonRoute = ({ customer, seller }: { customer: JSX.Element; seller: JSX.Element }) => {
  const { user } = useAuth()

  if (user) {
    return seller
  }

  return customer
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartFavoriteProvider>
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
              <Route path='products/:productId' element={<ProductDetail />} />
              <Route path='cart' element={<Cart />} />
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
              <Route path='favorites' element={<Favorites />} />
              <Route
                path='add-wallet'
                element={
                  <SellerRoute>
                    <AddWallet />
                  </SellerRoute>
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
                path='checkout'
                element={
                  <SellerRoute>
                    <Checkout />
                  </SellerRoute>
                }
              />
              <Route
                path='customer-checkout'
                element={
                  <PublicRoute>
                    <CustomerCheckout />
                  </PublicRoute>
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
                path='add-referral-code'
                element={
                  <SellerRoute>
                    <Referral />
                  </SellerRoute>
                }
              />
              <Route
                path='orders'
                element={<CommonRoute customer={<CustomerOrders />} seller={<Orders />} />}
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
    </CartFavoriteProvider>
  </StrictMode>
)
