import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useData } from "@/context/DataContext"

export default function Home() {
  const { user } = useAuth()
  const { orders, inventory, salesReports, trainingSessions } = useData()

  const activeOrders = orders.filter(
    (order) => !["entregado", "cancelado"].includes(order.status),
  )
  const pendingTraining = trainingSessions.filter((session) => !session.completed)
  const latestReport = salesReports.at(0)
  const lowStock = inventory.filter((item) => item.stock <= item.minStock)

  return (
    <section className="flex flex-col gap-10">
      <header className="grid gap-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 p-10">
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-[0.25em] text-amber-400">
            Plataforma operativa
          </span>
          <h1 className="font-heading text-4xl font-semibold text-slate-50 md:text-5xl">
            Controla pedidos, operaciones y equipo de La Casa de Monchita desde un
            mismo lugar.
          </h1>
          <p className="max-w-3xl text-lg text-slate-300">
            Visualiza el estado de cada pedido, gestiona inventario en tiempo real,
            procesa pagos seguros y coordina la formación del personal con una
            interfaz pensada para equipos de delivery.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-300">
          <Link
            to={user ? "/orders" : "/login"}
            className="rounded-full bg-amber-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            {user ? "Gestionar pedidos" : "Iniciar sesión"}
          </Link>
          {!user && (
            <Link
              to="/register"
              className="rounded-full border border-amber-300 px-6 py-3 font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-slate-950"
            >
              Crear cuenta operativa
            </Link>
          )}
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase text-amber-300">
            Pedidos activos
          </h2>
          <p className="mt-3 text-4xl font-bold text-slate-50">
            {activeOrders.length}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Seguimiento en tiempo real de cada entrega.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase text-amber-300">
            Alertas de inventario
          </h2>
          <p className="mt-3 text-4xl font-bold text-slate-50">{lowStock.length}</p>
          <p className="mt-2 text-sm text-slate-400">
            Ingredientes a reabastecer para evitar quiebres.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase text-amber-300">
            Reporte más reciente
          </h2>
          <p className="mt-3 text-2xl font-semibold text-slate-50">
            {latestReport?.period ?? "Sin datos"}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Ingresos $
            {latestReport
              ? latestReport.revenue.toLocaleString("es-VE", {
                  minimumFractionDigits: 2,
                })
              : "0.00"}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-sm font-semibold uppercase text-amber-300">
            Capacitaciones pendientes
          </h2>
          <p className="mt-3 text-4xl font-bold text-slate-50">
            {pendingTraining.length}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Sesiones clave para mantener la calidad del servicio.
          </p>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            Historias de usuario cubiertas
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              HU1 & HU8: Autenticación segura, perfiles por rol y cierre de sesión.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              HU2 & HU3: Flujo completo de pedidos con actualización de estados y
              alertas.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              HU5 & HU7: Métodos de pago controlados y analítica de ventas.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              HU6: Inventario con alertas automáticas y proveedores.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
              HU9 & HU10: Formación estructurada y repositorio documental.
            </li>
          </ul>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-lg font-semibold text-slate-100">
            Últimos pedidos
          </h2>
          <ul className="mt-4 space-y-4 text-sm text-slate-300">
            {orders.slice(0, 4).map((order) => (
              <li
                key={order.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-slate-100">
                    {order.id} · {order.customerName}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleString("es-VE")}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-wide text-amber-300">
                  {order.status.replace(/_/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </section>
  )
}
