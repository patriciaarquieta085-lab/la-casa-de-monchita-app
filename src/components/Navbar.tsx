import React from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

const navItems = [
  { to: "/orders", label: "Pedidos" },
  { to: "/notifications", label: "Notificaciones" },
  { to: "/payments", label: "Pagos" },
  { to: "/inventory", label: "Inventario" },
  { to: "/reports", label: "Reportes" },
  { to: "/security", label: "Seguridad" },
  { to: "/training", label: "Capacitación" },
  { to: "/docs", label: "Documentación" },
]

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link to="/" className="font-heading text-2xl font-semibold text-amber-400">
          La Casa de Monchita
        </Link>
        <div className="flex max-w-xl items-center gap-3 overflow-x-auto text-xs font-medium text-slate-300 md:max-w-none md:gap-4 md:text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-full px-4 py-2 transition-colors ${
                  isActive
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm">
                <p className="font-semibold text-amber-300">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-300 hover:text-slate-950"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex gap-3 text-sm font-semibold">
              <Link
                to="/login"
                className="rounded-full border border-amber-300 px-4 py-2 text-amber-300 transition hover:bg-amber-300 hover:text-slate-950"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-amber-400 px-4 py-2 text-slate-950 transition hover:bg-amber-300"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}