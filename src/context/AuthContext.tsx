import React, { createContext, useContext, useMemo, useState } from "react"
import { Role, User } from "@/types"
import { createId } from "@/utils/id"

type Credentials = {
  email: string
  password: string
}

type RegistrationValues = Credentials & {
  name: string
  role: Role
}

type AuthContextType = {
  user: User | null
  login: (credentials: Credentials) => Promise<void>
  register: (values: RegistrationValues) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUserDatabase: Record<string, RegistrationValues> = {
  "admin@monchita.com": {
    email: "admin@monchita.com",
    password: "monchita123",
    name: "Administrador",
    role: "admin",
  },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  async function login({ email, password }: Credentials) {
    const record = mockUserDatabase[email]
    if (!record || record.password !== password) {
      throw new Error("Credenciales inválidas")
    }

    setUser({
      id: createId("user"),
      email: record.email,
      name: record.name,
      role: record.role,
    })
  }

  async function register(values: RegistrationValues) {
    mockUserDatabase[values.email] = values
    setUser({
      id: createId("user"),
      email: values.email,
      name: values.name,
      role: values.role,
    })
  }

  function logout() {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      login,
      register,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }
  return context
}