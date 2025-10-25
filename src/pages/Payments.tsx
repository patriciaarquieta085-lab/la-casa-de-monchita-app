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
    transactionLog,
    paymentConfig,
    togglePaymentMethod,
    recordPayment,
    switchPaymentProvider,
  } = useData()

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      orderId: orders[0]?.id ?? "",
      methodId: paymentMethods[0]?.id ?? "",
      amount: orders[0]?.total ?? 0,
    },
  })

  const providers = [
    {
      id: "stripe" as const,
      label: "Stripe Sandbox",
      description:
        "Pruebas con tarjetas internacionales y validación PCI DSS automatizada.",
    },
    {
      id: "mercadopago" as const,
      label: "Mercado Pago Sandbox",
      description: "Entorno regionalizado con soporte para medios locales.",
    },
  ]

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
          Sandbox de pasarela de pago
        </h2>
        <div className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Selecciona el proveedor de pruebas para validar cobros sin afectar la producción. Las reglas de reintento se aplican automáticamente a cada checkout.
            </p>
            <div className="flex flex-wrap gap-3">
              {providers.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => switchPaymentProvider(provider.id)}
                  className={`rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                    paymentConfig.provider === provider.id
                      ? "border-emerald-300 bg-emerald-400 text-emerald-950"
                      : "border-slate-700 bg-slate-950/60 text-slate-300 hover:border-emerald-300 hover:text-emerald-200"
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              {providers.map((provider) => (
                <li
                  key={`${provider.id}-description`}
                  className={`rounded-xl border px-4 py-3 ${
                    paymentConfig.provider === provider.id
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {provider.label}
                  </p>
                  <p>{provider.description}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            <h3 className="mb-3 text-sm font-semibold text-slate-100">
              Parámetros activos
            </h3>
            <dl className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Clave pública
                </dt>
                <dd className="font-mono text-xs text-slate-100 break-all">
                  {paymentConfig.publicKey}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Endpoint
                </dt>
                <dd className="font-mono text-xs text-slate-100 break-all">
                  {paymentConfig.sandboxUrl}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Moneda
                </dt>
                <dd className="text-slate-100">{paymentConfig.currency}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Reintentos
                </dt>
                <dd className="text-slate-100">{paymentConfig.retries}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">
                  Espera entre intentos
                </dt>
                <dd className="text-slate-100">
                  {(paymentConfig.retryDelayMs / 1000).toFixed(1)} s
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

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

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Registro de transacciones sandbox
          </h2>
          <p className="text-xs text-slate-500">
            Monitoreo de reintentos, errores y referencias devueltas por la pasarela de pruebas.
          </p>
        </header>

        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/40">
          {transactionLog.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">
              Aún no se registran transacciones simuladas. Inicia un checkout desde la sección de pedidos para poblar la bitácora.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-slate-800 text-sm">
              <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Pedido</th>
                  <th className="px-4 py-3 text-left">Proveedor</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Intentos</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Referencia</th>
                  <th className="px-4 py-3 text-left">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactionLog.map((entry) => {
                  const statusClass =
                    entry.status === "aprobado"
                      ? "text-emerald-300"
                      : entry.status === "rechazado"
                      ? "text-rose-300"
                      : "text-amber-200"
                  return (
                    <tr key={entry.id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3 text-slate-300">
                        {new Date(entry.createdAt).toLocaleString("es-VE")}
                      </td>
                      <td className="px-4 py-3 text-slate-200">{entry.orderId}</td>
                      <td className="px-4 py-3 text-slate-300">{entry.provider}</td>
                      <td className="px-4 py-3 text-slate-200">${entry.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-300">{entry.attempts}</td>
                      <td className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${statusClass}`}>
                        {entry.status}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-200">
                        {entry.reference ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {entry.error ?? "Procesado correctamente"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </section>
  )
}
