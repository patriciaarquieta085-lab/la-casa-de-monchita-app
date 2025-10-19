import React from "react"

const controls = [
  {
    title: "Cifrado extremo a extremo",
    description:
      "Toda la comunicación entre la aplicación y las API de pagos se realiza mediante TLS 1.3 y tokens rotatorios.",
  },
  {
    title: "Gobernanza de accesos",
    description:
      "Roles diferenciados (HU1) con revisión mensual, bitácora de auditoría y cierres automáticos por inactividad.",
  },
  {
    title: "Backups y plan de contingencia",
    description:
      "Respaldos diarios en regiones redundantes y simulacros trimestrales de recuperación ante desastres.",
  },
  {
    title: "Cumplimiento PCI DSS",
    description:
      "Procesamiento de tarjetas delegado a proveedor certificado, con tokenización y segmentación de redes.",
  },
  {
    title: "Monitorización continua",
    description:
      "Alertas en tiempo real, detección de anomalías y tablero de incidentes para respuesta rápida.",
  },
]

const policies = [
  "Política de contraseñas fuertes y multifactor para personal administrativo.",
  "Capacitaciones HU9 enfocadas en phishing, higiene digital y privacidad del cliente.",
  "Checklist HU10 con procedimientos de respuesta ante incidentes y comunicación.",
  "Escaneo semanal de vulnerabilidades y pruebas de penetración semestrales.",
  "Gestión de proveedores con contratos de niveles de servicio y cláusulas de confidencialidad.",
]

export default function Security() {
  return (
    <section className="grid gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Seguridad informática y cumplimiento
        </h1>
        <p className="text-sm text-slate-400">
          HU8 · Controles técnicos, procesos y formación para proteger la operación.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {controls.map((control) => (
          <article
            key={control.title}
            className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-md shadow-slate-950/30"
          >
            <h2 className="text-lg font-semibold text-slate-100">{control.title}</h2>
            <p className="text-sm text-slate-300">{control.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Políticas y procedimientos activos
        </h2>
        <ul className="space-y-2 text-sm text-slate-300">
          {policies.map((policy) => (
            <li key={policy} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
              {policy}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 rounded-3xl border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
        <h2 className="text-lg font-semibold text-amber-200">
          Integración con otras historias
        </h2>
        <p>
          La autenticación reforzada (HU1) y los flujos de capacitación (HU9) se conectan con este módulo para asegurar que
          cada miembro del equipo comprende los protocolos definidos en la documentación técnica (HU10).
        </p>
      </section>
    </section>
  )
}
