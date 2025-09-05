import React from "react"
import { Link } from "react-router-dom"

export function Navbar() {
  return (
    <nav className="bg-brand-bg text-brand-gold py-4 shadow-gold">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/" className="font-bold text-2xl">Monchita</Link>
        <div className="space-x-6">
          <Link to="/orders" className="hover:underline">Pedidos</Link>
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/register" className="hover:underline">Registro</Link>
        </div>
      </div>
    </nav>
  )
}