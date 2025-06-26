import { createContext, ReactNode, useState } from 'react'
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
  updateUser: () => Promise<User | null> // Function to update user data
}

// Create the context
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  error: null,
  reloadUser: async () => null, // Add default reload function
  updateUser: async () => null, // Add default update function
})

// Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  // const checkLogin = async () => {
  //   const token = localStorage.getItem('token')
  //   if (!token) {
  //     setLoading(false)
  //     return
  //   }
  //   try {
  //     setLoading(true)
  //     const result = await verifyLogin()

  //     if (result?.success) {
  //       setUser(result.data?.user || null)
  //     } else {
  //       setUser(null)
  //     }
  //   } catch (error) {
  //     console.error('Login verification failed:', error)
  //     setError(error instanceof Error ? error : new Error('Login verification failed'))
  //     setUser(null)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // This function can be called to manually reload user data
  const reloadUser = async () => {
    try {
      const result = await verifyLogin()
      if (result?.success) {
        setUser(result.data || null)
        return result.data || null
      }
    } catch (error) {
      console.error('Error reloading user data:', error)
      return null
    }
  }
  const updateUser = async () => {
    try {
      const result = await verifyLogin()
      if (result?.success) {
        return (result.data?.user as User) || null
      }
      return null
    } catch (error) {
      return null
    }
  }

  // useEffect(() => {
  //   checkLogin()
  // }, [])

  if (loading) return <Loading />

  return (
    <UserContext.Provider value={{ user, setUser, loading, error, reloadUser, updateUser }}>
      {children}
    </UserContext.Provider>
  )
}
