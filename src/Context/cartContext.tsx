import React, { createContext, useContext, useEffect, useState } from 'react'
import { CART_ITEMS_KEY, FAVORITES_KEY } from '../utils/utils.variables'

// Define types
type CartFavoriteContextType = {
  cartCount: number
  favoriteCount: number
  loadCartCount: () => void
  loadFavoriteCount: () => void
  updateCartCount: (count: number) => void
  updateFavoriteCount: (count: number) => void
}

type CartFavoriteProviderProps = {
  children: React.ReactNode
}

// Create context with default values
const CartFavoriteContext = createContext<CartFavoriteContextType>({
  cartCount: 0,
  favoriteCount: 0,
  loadCartCount: () => {},
  loadFavoriteCount: () => {},
  updateCartCount: () => {},
  updateFavoriteCount: () => {},
})

// Create provider component
export const CartFavoriteProvider: React.FC<CartFavoriteProviderProps> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const cartKey = CART_ITEMS_KEY
  const favoriteKey = FAVORITES_KEY

  const loadCartCount = () => {
    const storedCart = localStorage.getItem(cartKey)
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart)
        setCartCount(Array.isArray(cartItems) ? cartItems.length : 0)
      } catch (error) {
        console.error('Error parsing cart items:', error)
        setCartCount(0)
      }
    } else {
      setCartCount(0)
    }
  }

  const loadFavoriteCount = () => {
    const storedFavorites = localStorage.getItem(favoriteKey)
    if (storedFavorites) {
      try {
        const favorites = JSON.parse(storedFavorites)
        setFavoriteCount(Array.isArray(favorites) ? favorites.length : 0)
      } catch (error) {
        console.error('Error parsing favorite items:', error)
        setFavoriteCount(0)
      }
    } else {
      setFavoriteCount(0)
    }
  }

  const updateCartCount = (count: number) => {
    setCartCount(count)
  }

  const updateFavoriteCount = (count: number) => {
    setFavoriteCount(count)
  }

  // Load counts on initial render
  useEffect(() => {
    loadCartCount()
    loadFavoriteCount()
  }, [])

  // Optional: Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === cartKey) {
        loadCartCount()
      }
      if (e.key === favoriteKey) {
        loadFavoriteCount()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [cartKey, favoriteKey])

  return (
    <CartFavoriteContext.Provider
      value={{
        cartCount,
        favoriteCount,
        loadCartCount,
        loadFavoriteCount,
        updateCartCount,
        updateFavoriteCount,
      }}
    >
      {children}
    </CartFavoriteContext.Provider>
  )
}

// Custom hook for easy consumption
export const useCartFavorite = () => {
  const context = useContext(CartFavoriteContext)
  if (!context) {
    throw new Error('useCartFavorite must be used within a CartFavoriteProvider')
  }
  return context
}
