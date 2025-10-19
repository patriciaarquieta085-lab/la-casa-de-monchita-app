import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z
    .string()
    .min(6, "Tu contraseña debe tener al menos 6 caracteres"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@monchita.com",
      password: "monchita123",
    },
  })

  async function onSubmit(values: LoginValues) {
    setError(null)
    try {
      await login(values)
      navigate("/orders")
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-3xl gap-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Acceso seguro para el equipo operativo
        </h1>
        <p className="text-sm text-slate-400">
          HU1 · Registro y autenticación con controles reforzados (HU8).
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-amber-200" htmlFor="email">
            Correo corporativo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
            placeholder="admin@monchita.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-semibold text-amber-200"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <p className="rounded-2xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isSubmitting ? "Validando credenciales..." : "Ingresar"}
        </button>
      </form>

      <ul className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
        <li>
          <span className="font-semibold text-amber-300">Doble validación:</span>{" "}
          contraseñas mínimas de 6 caracteres y usuarios autorizados.
        </li>
        <li>
          <span className="font-semibold text-amber-300">Sesiones seguras:</span>{" "}
          cierre forzoso de sesión al detectar actividad sospechosa.
        </li>
        <li>
          <span className="font-semibold text-amber-300">Auditoría:</span> registro
          de accesos para el plan de seguridad informática.
        </li>
      </ul>
    </section>
  )
}
