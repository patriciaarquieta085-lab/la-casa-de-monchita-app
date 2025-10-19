import React from "react"
import { Outlet } from "react-router-dom"
import { Navbar } from "./Navbar"

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-800 bg-slate-900 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} La Casa de Monchita</span>
          <span>Plataforma integral para pedidos, operaciones y formación.</span>
        </div>
      </footer>
    </div>
  )
}

export default Layout
