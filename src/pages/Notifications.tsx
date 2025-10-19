import React, { useMemo, useState } from "react"
import { useData } from "@/context/DataContext"
import { NotificationType } from "@/types"

const typeLabels: Record<NotificationType, string> = {
  pedido: "Pedidos",
  inventario: "Inventario",
  pago: "Pagos",
  seguridad: "Seguridad",
  entrenamiento: "Capacitación",
}

const filterOptions: Array<{ value: NotificationType | "todas"; label: string }> = [
  { value: "todas", label: "Todas" },
  { value: "pedido", label: typeLabels.pedido },
  { value: "inventario", label: typeLabels.inventario },
  { value: "pago", label: typeLabels.pago },
  { value: "seguridad", label: typeLabels.seguridad },
  { value: "entrenamiento", label: typeLabels.entrenamiento },
]

export default function Notifications() {
  const { notifications } = useData()
  const [filter, setFilter] = useState<NotificationType | "todas">("todas")

  const filteredNotifications = useMemo(() => {
    if (filter === "todas") return notifications
    return notifications.filter((notification) => notification.type === filter)
  }, [notifications, filter])

  return (
    <section className="grid gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Centro de notificaciones operativas
        </h1>
        <p className="text-sm text-slate-400">
          HU3 · Alertas en tiempo real del ciclo de pedido y operaciones clave.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
              filter === option.value
                ? "bg-amber-400 text-slate-950"
                : "border border-slate-700 text-slate-300 hover:border-amber-300 hover:text-amber-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <ul className="grid gap-4">
        {filteredNotifications.map((notification) => (
          <li
            key={notification.id}
            className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
                  {typeLabels[notification.type]}
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  {notification.title}
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(notification.timestamp).toLocaleString("es-VE")}
              </span>
            </div>

            <p className="text-sm text-slate-300">{notification.message}</p>
            {notification.relatedOrderId && (
              <p className="text-xs text-slate-400">
                Pedido relacionado: {notification.relatedOrderId}
              </p>
            )}
          </li>
        ))}
        {filteredNotifications.length === 0 && (
          <p className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center text-sm text-slate-400">
            No hay notificaciones para este filtro.
          </p>
        )}
      </ul>
    </section>
  )
}
