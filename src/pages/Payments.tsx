import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useData } from "@/context/DataContext"

const paymentSchema = z.object({
  orderId: z.string().min(1, "Selecciona un pedido"),
  methodId: z.string().min(1, "Selecciona un método"),
  amount: z.coerce.number().min(1, "Monto inválido"),
})

type PaymentValues = z.infer<typeof paymentSchema>

export default function Payments() {
  const {
    orders,
    paymentMethods,
    paymentHistory,
    togglePaymentMethod,
    recordPayment,
  } = useData()

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: orders[0]?.id ?? "",
      methodId: paymentMethods[0]?.id ?? "",
      amount: orders[0]?.total ?? 0,
    },
  })

  function onSubmit(values: PaymentValues) {
    recordPayment(values.orderId, values.methodId, values.amount)
    form.reset(values)
  }

  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Procesamiento y control de pagos
        </h1>
        <p className="text-sm text-slate-400">
          HU5 · Consolidación de métodos y trazabilidad de transacciones.
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/30">
        <h2 className="text-lg font-semibold text-slate-100">
          Registro manual de pago
        </h2>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="orderId">
              Pedido
            </label>
            <select
              id="orderId"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
              {...form.register("orderId")}
            >
              <option value="">Selecciona pedido</option>
              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  {order.id} · {order.customerName} (${order.total.toFixed(2)})
                </option>
              ))}
            </select>
            {form.formState.errors.orderId && (
              <p className="text-xs text-rose-400">
                {form.formState.errors.orderId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="methodId">
              Método de pago
            </label>
            <select
              id="methodId"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
              {...form.register("methodId")}
            >
              <option value="">Selecciona método</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} {method.enabled ? "" : "(deshabilitado)"}
                </option>
              ))}
            </select>
            {form.formState.errors.methodId && (
              <p className="text-xs text-rose-400">
                {form.formState.errors.methodId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="amount">
              Monto
            </label>
            <input
              id="amount"
              type="number"
              min={0}
              step="0.1"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
              {...form.register("amount")}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-rose-400">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="md:col-span-3 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            Registrar pago
          </button>
        </form>
      </section>

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Configuración de métodos
          </h2>
          <p className="text-xs text-slate-500">
            Control de disponibilidad y costos operativos por método.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paymentMethods.map((method) => (
            <article
              key={method.id}
              className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-md shadow-slate-950/40"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {method.name}
                  </h3>
                  <p className="text-xs text-slate-400">Liquidación: {method.settlementTime}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    method.enabled
                      ? "bg-emerald-400/20 text-emerald-200"
                      : "bg-rose-400/20 text-rose-200"
                  }`}
                >
                  {method.enabled ? "Activo" : "Inactivo"}
                </span>
              </header>
              <p className="text-sm text-slate-300">{method.description}</p>
              <p className="text-xs text-slate-400">Comisiones: {method.fees}</p>
              <button
                type="button"
                className="rounded-2xl border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-amber-300 hover:text-amber-200"
                onClick={() => togglePaymentMethod(method.id)}
              >
                {method.enabled ? "Deshabilitar" : "Habilitar"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Historial de cobros recientes
          </h2>
          <p className="text-xs text-slate-500">
            Trazabilidad para auditorías financieras (HU7 y HU8).
          </p>
        </header>
        <ul className="grid gap-3">
          {paymentHistory.length === 0 && (
            <li className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              Aún no se registran pagos.
            </li>
          )}
          {paymentHistory.map((record) => {
            const method = paymentMethods.find((item) => item.id === record.methodId)
            const order = orders.find((item) => item.id === record.orderId)
            return (
              <li
                key={record.id}
                className="grid gap-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">
                    Pedido {record.orderId} · ${record.amount.toFixed(2)}
                  </p>
                  <span className="text-xs text-slate-400">
                    {new Date(record.processedAt).toLocaleString("es-VE")}
                  </span>
                </div>
                <p>
                  Método: {method?.name ?? record.methodId} · Cliente: {order?.customerName ?? "—"}
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
                  {record.status}
                </p>
              </li>
            )
          })}
        </ul>
      </section>
    </section>
  )
}
