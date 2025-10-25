import React, { useMemo, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useData } from "@/context/DataContext"
import { OrderFormValues, OrderStatus } from "@/types"

const itemSchema = z.object({
  name: z.string().min(2, "Indica el producto"),
  quantity: z.coerce.number().min(1, "Cantidad mínima 1"),
  unitPrice: z.coerce.number().min(0.5, "Precio inválido"),
})

const orderSchema = z.object({
  customerName: z.string().min(3, "Ingresa el nombre del cliente"),
  deliveryAddress: z.string().min(5, "Incluye dirección de entrega"),
  paymentMethod: z.string().min(2, "Selecciona un método de pago"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Agrega al menos un producto"),
})

const statusLabels: Record<OrderStatus, string> = {
  recibido: "Recibido",
  preparando: "Preparando",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

const statusFlow: OrderStatus[] = [
  "recibido",
  "preparando",
  "en_camino",
  "entregado",
]

export default function Orders() {
  const { orders, paymentMethods, addOrder, updateOrderStatus } = useData()
  const [feedback, setFeedback] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const queue = useMemo(
    () =>
      orders
        .filter(
          (order) => order.status !== "entregado" && order.status !== "cancelado",
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [orders],
  )

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: [
        {
          name: "Arepa Reina Pepiada",
          quantity: 1,
          unitPrice: 4.5,
        },
      ],
      paymentMethod: "tarjeta",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  async function onSubmit(values: OrderFormValues) {
    setIsSubmitting(true)
    setFeedback(null)
    const result = await addOrder(values)
    if (!result.success) {
      setFeedback({
        type: "error",
        message: result.error ?? "No se pudo registrar el pedido.",
      })
      setIsSubmitting(false)
      return
    }

    setFeedback({
      type: "success",
      message: `Pedido ${result.order?.id ?? "nuevo"} añadido a la cola de producción.`,
    })
    form.reset({
      customerName: "",
      deliveryAddress: "",
      paymentMethod: values.paymentMethod,
      notes: "",
      items: [
        {
          name: "",
          quantity: 1,
          unitPrice: 1,
        },
      ],
    })
    setIsSubmitting(false)
  }

  function progress(orderStatus: OrderStatus) {
    const index = statusFlow.indexOf(orderStatus)
    if (index === -1) return 100
    return ((index + 1) / statusFlow.length) * 100
  }

  function timeSince(date: string) {
    const parsed = new Date(date)
    const diff = Date.now() - parsed.getTime()
    if (Number.isNaN(diff) || diff < 0) {
      return "-"
    }
    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} h`
    const days = Math.floor(hours / 24)
    return `${days} d`
  }

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateOrderStatus(orderId, status)
  }

  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Gestión integral de pedidos
        </h1>
        <p className="text-sm text-slate-400">
          HU2 · Registro de pedidos y HU3 · Actualización de estados con bitácora.
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/30">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-slate-100">
            Tablero de producción en tiempo real
          </h2>
          <p className="text-xs text-slate-500">
            Cola actual: {queue.length} pedido{queue.length === 1 ? "" : "s"} esperando ejecución.
          </p>
        </header>

        <div className="grid gap-4">
          {queue.length === 0 ? (
            <p className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-400">
              No hay pedidos pendientes. Los nuevos pedidos aparecerán aquí para facilitar la priorización.
            </p>
          ) : (
            queue.map((order, index) => (
              <article
                key={order.id}
                className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Cola #{index + 1}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {order.customerName} · {order.id}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Tiempo en cola: {timeSince(order.createdAt)} · Total ${order.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Estado actual
                    </p>
                    <p className="text-sm font-semibold text-amber-200">
                      {statusLabels[order.status]}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {statusFlow.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(order.id, status)}
                      className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
                        order.status === status
                          ? "border-amber-300 bg-amber-300 text-slate-900"
                          : "border-slate-700 bg-slate-900/60 text-slate-200 hover:border-amber-200 hover:text-amber-200"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(order.id, "cancelado")}
                    className="rounded-full border border-rose-400/60 bg-rose-500/10 px-4 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-400/30"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid gap-1 text-xs text-slate-400 md:grid-cols-2">
                  <p>
                    Dirección: <span className="text-slate-200">{order.deliveryAddress}</span>
                  </p>
                  <p>
                    Método de pago: <span className="text-slate-200">{order.paymentMethod}</span>
                  </p>
                  <p className="md:col-span-2">
                    Productos: {order.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
                  </p>
                  <div className="md:col-span-2">
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-400/80"
                        style={{ width: `${progress(order.status)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <div className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/30">
        <h2 className="text-lg font-semibold text-slate-100">
          Crear nuevo pedido
        </h2>
        {feedback && (
          <p
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                : "border-rose-400/60 bg-rose-500/10 text-rose-100"
            }`}
          >
            {feedback.message}
          </p>
        )}
        <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200" htmlFor="customerName">
                Cliente
              </label>
              <input
                id="customerName"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                placeholder="Nombre del cliente"
                {...form.register("customerName")}
              />
              {form.formState.errors.customerName && (
                <p className="text-xs text-rose-400">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200" htmlFor="deliveryAddress">
                Dirección
              </label>
              <input
                id="deliveryAddress"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                placeholder="Ej. Av. Sucre, Edif. 12"
                {...form.register("deliveryAddress")}
              />
              {form.formState.errors.deliveryAddress && (
                <p className="text-xs text-rose-400">
                  {form.formState.errors.deliveryAddress.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-amber-200">
                Productos del pedido
              </h3>
              <button
                type="button"
                className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-slate-950"
                onClick={() => append({ name: "", quantity: 1, unitPrice: 1 })}
              >
                Añadir producto
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-[2fr,repeat(2,1fr),auto]"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Producto
                    </label>
                    <input
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                      placeholder="Ej. Tequeños artesanales"
                      {...form.register(`items.${index}.name` as const)}
                    />
                    {form.formState.errors.items?.[index]?.name && (
                      <p className="text-xs text-rose-400">
                        {form.formState.errors.items?.[index]?.name?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                      {...form.register(`items.${index}.quantity` as const)}
                    />
                    {form.formState.errors.items?.[index]?.quantity && (
                      <p className="text-xs text-rose-400">
                        {form.formState.errors.items?.[index]?.quantity?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Precio unitario ($)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0.5}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                      {...form.register(`items.${index}.unitPrice` as const)}
                    />
                    {form.formState.errors.items?.[index]?.unitPrice && (
                      <p className="text-xs text-rose-400">
                        {form.formState.errors.items?.[index]?.unitPrice?.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="self-end rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
                    onClick={() => remove(index)}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.5fr,1fr]">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200" htmlFor="paymentMethod">
                Método de pago (HU5)
              </label>
              <select
                id="paymentMethod"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                {...form.register("paymentMethod")}
              >
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id} disabled={!method.enabled}>
                    {method.name} {method.enabled ? "" : "(deshabilitado)"}
                  </option>
                ))}
              </select>
              {form.formState.errors.paymentMethod && (
                <p className="text-xs text-rose-400">
                  {form.formState.errors.paymentMethod.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-amber-200" htmlFor="notes">
                Observaciones
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                placeholder="Sin picante, entregar con factura"
                {...form.register("notes")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isSubmitting
                ? "cursor-not-allowed bg-emerald-900/40 text-emerald-200/70"
                : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
            }`}
          >
            {isSubmitting ? "Validando pago..." : "Registrar pedido"}
          </button>
        </form>
      </div>

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Bitácora de pedidos</h2>
          <p className="text-xs text-slate-500">
            Estado consolidado de cada pedido y tiempo desde su creación.
          </p>
        </header>

        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/40">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4 text-left">Pedido</th>
                <th className="px-6 py-4 text-left">Cliente</th>
                <th className="px-6 py-4 text-left">Estado</th>
                <th className="px-6 py-4 text-left">Tiempo en cola</th>
                <th className="px-6 py-4 text-left">Última actualización</th>
                <th className="px-6 py-4 text-left">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/50">
                  <td className="px-6 py-4 text-slate-200">{order.id}</td>
                  <td className="px-6 py-4 text-slate-300">{order.customerName}</td>
                  <td className="px-6 py-4 text-amber-200">{statusLabels[order.status]}</td>
                  <td className="px-6 py-4 text-slate-300">{timeSince(order.createdAt)}</td>
                  <td className="px-6 py-4 text-slate-400">{timeSince(order.updatedAt)}</td>
                  <td className="px-6 py-4 text-slate-200">${order.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
