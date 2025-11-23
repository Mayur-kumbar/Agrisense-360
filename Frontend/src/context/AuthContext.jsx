import React, { createContext, useState, useEffect } from 'react'
import { setAuthToken } from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) setAuthToken(token)
  }, [token])

  const login = (token) => {
    localStorage.setItem('token', token)
    setToken(token)
    setAuthToken(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
