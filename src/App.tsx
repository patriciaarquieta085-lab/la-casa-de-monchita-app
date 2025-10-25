import React from "react"
import { Route, Routes } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import Home from "@/pages/Home"
import Login from "@/pages/Login"
import Orders from "@/pages/Orders"
import Register from "@/pages/Register"
import Notifications from "@/pages/Notifications"
import Payments from "@/pages/Payments"
import Inventory from "@/pages/Inventory"
import Reports from "@/pages/Reports"
import Security from "@/pages/Security"
import Training from "@/pages/Training"
import Documentation from "@/pages/Documentation"

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="orders" element={<Orders />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="payments" element={<Payments />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="reports" element={<Reports />} />
          <Route path="security" element={<Security />} />
          <Route path="training" element={<Training />} />
          <Route path="docs" element={<Documentation />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
