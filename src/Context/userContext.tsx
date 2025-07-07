import { createContext, ReactNode, useEffect, useState } from 'react'
import { verifyLogin } from '../Api/auth.api'
import Loading from '../Components/Loading'
export interface Wallet {
  walletId: number
  userId: string
  userName: string
  userPhoneNo: string
  walletName: string
  walletPhoneNo: string
}

export interface User {
  userId: string
  phoneNo: string
  name: string
  zilla: string
  upazilla: string
  address: string
  referralCode?: string | null
  email?: string | null
  isVerified: boolean
  balance: number
  shopName?: string | null
  nomineePhone?: string | null
  role: 'Seller' | 'Admin'
  wallets?: Wallet[] // Optional property for wallets
  facebookProfileLink?: string | null
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
  error: Error | null
  reloadUser: () => Promise<null | User> // Add reload function to context type
}

// Create the context
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  error: null,
  reloadUser: async () => null, // Add default reload function
})

// Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error] = useState<Error | null>(null)

  const checkLogin = async () => {
    try {
      setLoading(true)
      const result = await verifyLogin()

      if (result?.success && result.data?.role === 'Seller') {
        setUser(result.data || null)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking login:', error)
      setUser(null)
      // Optionally, you can set an error state here if needed
      // setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  // This function can be called to manually reload user data
  const reloadUser = async () => {
    try {
      const result = await verifyLogin()
      if (result?.success && result.data?.role === 'Seller') {
        setUser(result.data || null)
        return result.data || null
      }
    } catch (error) {
      console.error('Error reloading user data:', error)
      return null
    }
  }

  useEffect(() => {
    checkLogin()
  }, [])

  if (loading) return <Loading />

  return (
    <UserContext.Provider value={{ user, setUser, loading, error, reloadUser }}>
      {children}
    </UserContext.Provider>
  )
}
