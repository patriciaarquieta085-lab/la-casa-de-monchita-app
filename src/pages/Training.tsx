import React from "react"
import { useData } from "@/context/DataContext"

export default function Training() {
  const { trainingSessions, markTrainingCompleted } = useData()

  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Programa de capacitación del personal
        </h1>
        <p className="text-sm text-slate-400">
          HU9 · Planificación, seguimiento y evidencia de formación continua.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {trainingSessions.map((session) => (
          <article
            key={session.id}
            className="grid gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-md shadow-slate-950/30"
          >
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{session.title}</h2>
                <p className="text-xs text-slate-400">
                  {new Date(session.scheduledAt).toLocaleString("es-VE")}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  session.completed
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-amber-400/20 text-amber-200"
                }`}
              >
                {session.completed ? "Completado" : "Pendiente"}
              </span>
            </header>
            <p className="text-sm text-slate-300">{session.description}</p>
            <p className="text-xs text-slate-400">
              Duración estimada: {session.durationMinutes} minutos
            </p>
            {!session.completed && (
              <button
                type="button"
                className="rounded-2xl bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-950 transition hover:bg-emerald-300"
                onClick={() => markTrainingCompleted(session.id)}
              >
                Registrar finalización
              </button>
            )}
          </article>
        ))}
      </section>
    </section>
  )
}
