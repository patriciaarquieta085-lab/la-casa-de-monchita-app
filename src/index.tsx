import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./index.css"
import { AuthProvider } from "@/context/AuthContext"
import { DataProvider } from "@/context/DataContext"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("No se encontró el elemento raíz para inicializar la aplicación")
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
