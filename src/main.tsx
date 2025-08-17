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
import Profile from './Components/Profile.tsx'
import Referral from './Components/Refferal.tsx'
import Register from './Components/Register.tsx'
import SalesGuidelines from './Components/SalesGuideline.tsx'
import SellerHomeDashboard from './Components/SellersAdminDashboard.tsx'
import SupportCenter from './Components/SupportCenter.tsx'

import WithdrawHistory from './Components/WithdrawHistory.tsx'
import WithdrawRequest from './Components/WithdrawRequest.tsx'
import { UserProvider } from './Context/userContext.tsx'
import { useAuth } from './Hooks/useAuth.tsx'
import './index.css'

import * as Sentry from '@sentry/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import NewSupportTicketPage from './Components/AddTicket.tsx'
import AddWallet from './Components/AddWallet.tsx'
import Categories from './Components/Categories.tsx'
import CustomerCheckout from './Components/CustomerCheckout.tsx'
import CustomerOrders from './Components/CustomerOrders.tsx'
import CustomerRegister from './Components/CustomerRegister.tsx'
import Footer from './Components/Footer.tsx'
import FraudCheckComponent from './Components/FraudChecker.tsx'
import ResellerPassiveIncome from './Components/PassiveIncome.tsx'
import PayDue from './Components/PayDue.tsx'
import PaymentHistory from './Components/PaymentHistory.tsx'
import PrivacyPolicy from './Components/PrivacyPolicy.tsx'
import ProductDetail from './Components/ProductDetail.tsx'
import ProductList from './Components/Products.tsx'
import RefundPolicy from './Components/RefundPolicy.tsx'
import SellerDashboard from './Components/SellerDashboard.tsx'
import SupportTicketDetailPage from './Components/SupportTicketDetail.tsx'
import {
  default as SupportTicketPage,
  default as SupportTicketsPage,
} from './Components/SupportTicketList.tsx'
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
const WithFooter = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth()
  if (user) return children
  return (
    <>
      {children}
      <Footer />
    </>
  )
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
const UserProviderWrapper = () => {
  const { customerMode } = useAuth()
  return (
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
                <WithFooter>
                  <PrivacyPolicy />
                </WithFooter>
              </PublicRoute>
            }
          />
          <Route
            path='terms-conditions'
            element={
              <PublicRoute>
                <WithFooter>
                  <TermsAndConditions />
                </WithFooter>
              </PublicRoute>
            }
          />
          <Route
            path='return-refund-policy'
            element={
              <PublicRoute>
                <WithFooter>
                  <RefundPolicy />
                </WithFooter>
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
              <QueryClientProvider client={new QueryClient()}>
                <SellerRoute>
                  <SellerDashboard />
                </SellerRoute>
              </QueryClientProvider>
            }
          />
          <Route path='product-detail/:productId' element={<PublicProductDetails />} />
          <Route
            path='categories'
            element={
              <WithFooter>
                <Categories />
              </WithFooter>
            }
          />
          <Route path='/products' element={<ProductList />} />
          <Route
            path='products/:productId'
            element={
              <WithFooter>
                <ProductDetail />
              </WithFooter>
            }
          />
          <Route
            path='cart'
            element={
              <WithFooter>
                <Cart />
              </WithFooter>
            }
          />
          <Route
            path='support'
            element={
              <WithFooter>
                <SupportCenter />
              </WithFooter>
            }
          />
          <Route
            path='selling-guide'
            element={
              <SellerRoute>
                <SalesGuidelines />
              </SellerRoute>
            }
          />
          <Route
            path='faq'
            element={
              <WithFooter>
                <FAQSection />
              </WithFooter>
            }
          />
          <Route
            path='support-tickets'
            element={
              <SellerRoute>
                <SupportTicketsPage />
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
            path='check-fraud'
            element={
              <SellerRoute>
                <FraudCheckComponent />
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
          {customerMode === false && (
            <Route
              path='register'
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
          )}
          <Route
            path='customer-register'
            element={
              <PublicRoute>
                <CustomerRegister />
              </PublicRoute>
            }
          />
          {customerMode === false && (
            <Route
              path='login'
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
          )}
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
          <Route
            path='support-tickets'
            element={
              <PrivateRoute>
                <SupportTicketPage />
              </PrivateRoute>
            }
          />
          <Route
            path='support-tickets/:ticketId'
            element={
              <PrivateRoute>
                <SupportTicketDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path='support-tickets/new'
            element={
              <PrivateRoute>
                <NewSupportTicketPage />
              </PrivateRoute>
            }
          />
          <Route path='*' element={<CatchAllRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartFavoriteProvider>
      <UserProvider>
        <UserProviderWrapper />
      </UserProvider>
    </CartFavoriteProvider>
  </StrictMode>
)
