import React from "react"
import { useData } from "@/context/DataContext"

const categoryLabels: Record<string, string> = {
  tecnica: "Técnica",
  operativa: "Operativa",
  seguridad: "Seguridad",
  pagos: "Pagos",
}

export default function Documentation() {
  const { documentation } = useData()

  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Documentación técnica y operativa
        </h1>
        <p className="text-sm text-slate-400">
          HU10 · Recursos centralizados para soporte, operaciones y seguridad.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {documentation.map((resource) => (
          <article
            key={resource.id}
            className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-md shadow-slate-950/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-amber-300">
                  {categoryLabels[resource.category] ?? resource.category}
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  {resource.title}
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Actualizado {new Date(resource.lastUpdated).toLocaleDateString("es-VE")}
              </span>
            </div>
            <p className="text-sm text-slate-300">{resource.description}</p>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-amber-300"
            >
              Consultar recurso
            </a>
          </article>
        ))}
      </section>
    </section>
  )
}
