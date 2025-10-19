import React from "react"
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
    addOrder(values)
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
  }

  function progress(orderStatus: OrderStatus) {
    const index = statusFlow.indexOf(orderStatus)
    if (index === -1) return 100
    return ((index + 1) / statusFlow.length) * 100
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

      <div className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-lg shadow-slate-950/30">
        <h2 className="text-lg font-semibold text-slate-100">
          Crear nuevo pedido
        </h2>
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
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Guardar pedido
          </button>
        </form>
      </div>

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Pedidos en curso</h2>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Seguimiento HU2 · HU3
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-md shadow-slate-950/40"
            >
              <header className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-50">
                    {order.customerName}
                  </h3>
                  <p className="text-xs text-slate-400">{order.id}</p>
                </div>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                  {statusLabels[order.status]}
                </span>
              </header>

              <div className="space-y-2 text-sm text-slate-300">
                <p className="font-medium text-slate-200">{order.deliveryAddress}</p>
                <ul className="space-y-1 text-xs">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity} × {item.name}
                    </li>
                  ))}
                </ul>
                <p className="text-sm font-semibold text-emerald-300">
                  Total: ${order.total.toFixed(2)} · Pago: {order.paymentMethod}
                </p>
              </div>

              <div className="space-y-3">
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-300"
                    style={{ width: `${progress(order.status)}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-400">
                  {statusFlow.map((status) => (
                    <span
                      key={status}
                      className={`rounded-full px-3 py-1 ${
                        statusFlow.indexOf(status) <= statusFlow.indexOf(order.status)
                          ? "bg-amber-400/20 text-amber-200"
                          : "bg-slate-800"
                      }`}
                    >
                      {statusLabels[status]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                {order.status !== "entregado" && order.status !== "cancelado" && (
                  <button
                    type="button"
                    className="flex-1 rounded-2xl bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-300"
                    onClick={() => updateOrderStatus(order.id)}
                  >
                    Avanzar estado
                  </button>
                )}
                <button
                  type="button"
                  className="rounded-2xl border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
                  onClick={() => updateOrderStatus(order.id, "cancelado")}
                >
                  Marcar cancelado
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
