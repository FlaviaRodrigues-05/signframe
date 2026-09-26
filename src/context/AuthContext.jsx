import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const isLoggedIn = !!user

  const username = user?.email
    ? (() => {
        const namePart = user.email.split('@')[0]
        return namePart.charAt(0).toUpperCase() + namePart.slice(1)
      })()
    : ''

  async function logout(){
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, username, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){
  return useContext(AuthContext)
}