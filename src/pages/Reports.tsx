import React from "react"
import { useData } from "@/context/DataContext"

export default function Reports() {
  const { salesReports, orders, paymentHistory } = useData()

  const totalRevenue = salesReports.reduce((acc, report) => acc + report.revenue, 0)
  const totalOrders = salesReports.reduce((acc, report) => acc + report.orders, 0)
  const averageTicket = totalOrders ? totalRevenue / totalOrders : 0
  const paymentVolume = paymentHistory.reduce((acc, record) => acc + record.amount, 0)

  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Reportes e inteligencia de ventas
        </h1>
        <p className="text-sm text-slate-400">
          HU7 · Métricas para toma de decisiones y seguimiento financiero.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-slate-400">Ingresos</h2>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">
            ${totalRevenue.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-2 text-xs text-slate-400">Últimos {salesReports.length} meses reportados.</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-slate-400">Pedidos</h2>
          <p className="mt-3 text-3xl font-semibold text-amber-300">{totalOrders}</p>
          <p className="mt-2 text-xs text-slate-400">Promedio diario {(totalOrders / 30).toFixed(1)}</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-slate-400">Ticket promedio</h2>
          <p className="mt-3 text-3xl font-semibold text-slate-100">
            ${averageTicket.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-slate-400">Basado en ventas consolidadas.</p>
        </article>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xs uppercase tracking-[0.4em] text-slate-400">Pagos registrados</h2>
          <p className="mt-3 text-3xl font-semibold text-slate-100">
            ${paymentVolume.toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-slate-400">Sumatoria de transacciones aprobadas.</p>
        </article>
      </section>

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Resumen mensual</h2>
          <p className="text-xs text-slate-500">
            Desglose de KPIs críticos por periodo operativo.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {salesReports.map((report) => (
            <article
              key={report.id}
              className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-md shadow-slate-950/30"
            >
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">{report.period}</h3>
                <span className="text-xs text-slate-400">
                  Generado {new Date(report.createdAt).toLocaleDateString("es-VE")}
                </span>
              </header>
              <div className="grid grid-cols-2 gap-3 text-sm text-slate-300">
                <p>
                  Ventas: <span className="font-semibold">${report.revenue.toFixed(2)}</span>
                </p>
                <p>
                  Pedidos: <span className="font-semibold">{report.orders}</span>
                </p>
                <p>
                  Ticket: <span className="font-semibold">${report.averageTicket.toFixed(2)}</span>
                </p>
                <p>
                  Producto estrella: <span className="font-semibold">{report.topProduct}</span>
                </p>
              </div>
              <p className="text-xs text-slate-500">
                Insight: {orders.filter((order) => order.paymentMethod === "tarjeta").length} pedidos con tarjeta este periodo.
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
