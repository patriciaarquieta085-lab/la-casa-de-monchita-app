import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useData } from "@/context/DataContext"

const restockSchema = z.object({
  itemId: z.string().min(1, "Selecciona un insumo"),
  quantity: z.coerce.number().min(1, "Indica la cantidad"),
})

type RestockValues = z.infer<typeof restockSchema>

export default function Inventory() {
  const { inventory, adjustInventory } = useData()
  const [selectedItem, setSelectedItem] = useState(inventory[0]?.id ?? "")

  const form = useForm<RestockValues>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      itemId: inventory[0]?.id ?? "",
      quantity: 5,
    },
  })

  const itemIdField = form.register("itemId")
  const quantityField = form.register("quantity")

  function onSubmit(values: RestockValues) {
    adjustInventory(values.itemId, values.quantity)
    form.reset(values)
  }

  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Gestión de inventario y stock
        </h1>
        <p className="text-sm text-slate-400">
          HU6 · Control de insumos, proveedores y alertas de abastecimiento.
        </p>
      </header>

      <section className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/30">
        <h2 className="text-lg font-semibold text-slate-100">
          Reabastecer insumo
        </h2>
        <form className="grid gap-4 md:grid-cols-[2fr,1fr,auto]" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="itemId">
              Insumo
            </label>
            <select
              id="itemId"
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
              {...itemIdField}
              onChange={(event) => {
                itemIdField.onChange(event)
                setSelectedItem(event.target.value)
              }}
            >
              <option value="">Selecciona insumo</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · Stock actual {item.stock} {item.unit}
                </option>
              ))}
            </select>
            {form.formState.errors.itemId && (
              <p className="text-xs text-rose-400">
                {form.formState.errors.itemId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400" htmlFor="quantity">
              Cantidad
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
              {...quantityField}
            />
            {form.formState.errors.quantity && (
              <p className="text-xs text-rose-400">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="self-end rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            Registrar ingreso
          </button>
        </form>

        {selectedItem && (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            {(() => {
              const item = inventory.find((inv) => inv.id === selectedItem)
              if (!item) return null
              const level = item.stock <= item.minStock ? "Bajo" : "Óptimo"
              return (
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-100">{item.name}</p>
                    <p>Proveedor: {item.supplier}</p>
                  </div>
                  <div className="text-right">
                    <p>
                      Stock: <span className="font-semibold">{item.stock}</span> {item.unit}
                    </p>
                    <p className="text-xs text-slate-400">Mínimo recomendado: {item.minStock} {item.unit}</p>
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        level === "Bajo" ? "text-rose-300" : "text-emerald-300"
                      }`}
                    >
                      Nivel actual: {level}
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </section>

      <section className="grid gap-4">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-100">
            Inventario detallado
          </h2>
          <p className="text-xs text-slate-500">
            Visualiza disponibilidad por insumo y toma decisiones en cocina.
          </p>
        </header>
        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/40">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-4 text-left">Insumo</th>
                <th className="px-6 py-4 text-left">Stock</th>
                <th className="px-6 py-4 text-left">Mínimo</th>
                <th className="px-6 py-4 text-left">Proveedor</th>
                <th className="px-6 py-4 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/60">
                  <td className="px-6 py-4 text-slate-200">{item.name}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {item.stock} {item.unit}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {item.minStock} {item.unit}
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.supplier}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-amber-300 hover:text-amber-200"
                        onClick={() => adjustInventory(item.id, 1)}
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-rose-300 hover:text-rose-200"
                        onClick={() => adjustInventory(item.id, -1)}
                      >
                        -1
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}
