import React, { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, "Ingresa el nombre completo")
      .max(80, "Máximo 80 caracteres"),
    email: z.string().email("Correo corporativo inválido"),
    password: z
      .string()
      .min(8, "Debe incluir al menos 8 caracteres")
      .regex(/\d/, "Incluye al menos un número"),
    role: z.enum(["admin", "staff", "viewer"], {
      errorMap: () => ({ message: "Selecciona un rol" }),
    }),
    trainingGoals: z
      .array(
        z.object({
          topic: z.string().min(3, "Describe el objetivo"),
        }),
      )
      .min(1, "Define al menos un objetivo de capacitación"),
  })
  .superRefine((values, ctx) => {
    if (values.role === "viewer" && values.trainingGoals.length > 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los perfiles de auditoría solo pueden registrar 2 objetivos",
        path: ["trainingGoals"],
      })
    }
  })

type RegisterValues = z.infer<typeof registerSchema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "staff",
      trainingGoals: [{ topic: "Dominio de panel de pedidos" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "trainingGoals",
  })

  async function onSubmit(values: RegisterValues) {
    setFeedback(null)
    try {
      await registerUser(values)
      setFeedback("Usuario registrado correctamente. Redirigiendo...")
      setTimeout(() => navigate("/orders"), 1200)
    } catch (error) {
      setFeedback((error as Error).message)
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-4xl gap-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
      <header className="space-y-2 text-center">
        <h1 className="font-heading text-3xl font-semibold text-slate-50">
          Crear cuenta operativa
        </h1>
        <p className="text-sm text-slate-400">
          HU1 · Onboarding guiado del personal (HU9) con roles y objetivos claros.
        </p>
      </header>

      <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-amber-200" htmlFor="name">
            Nombre y apellido
          </label>
          <input
            id="name"
            type="text"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
            placeholder="María González"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-rose-400">{errors.name.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-amber-200" htmlFor="email">
            Correo corporativo
          </label>
          <input
            id="email"
            type="email"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
            placeholder="operaciones@monchita.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            className="text-sm font-semibold text-amber-200"
            htmlFor="password"
          >
            Contraseña segura
          </label>
          <input
            id="password"
            type="password"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
            placeholder="M0nchita2024"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-rose-400">{errors.password.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-semibold text-amber-200" htmlFor="role">
            Rol en la operación
          </label>
          <select
            id="role"
            className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
            {...register("role")}
          >
            <option value="admin">Administrador</option>
            <option value="staff">Logística / Cocina</option>
            <option value="viewer">Auditoría</option>
          </select>
          {errors.role && (
            <p className="text-xs text-rose-400">{errors.role.message}</p>
          )}
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-amber-200">
              Objetivos de capacitación (HU9)
            </h2>
            <button
              type="button"
              className="rounded-full border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-300 hover:text-slate-950"
              onClick={() => append({ topic: "" })}
            >
              Añadir
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <input
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40"
                  placeholder="Ej. Dominio de protocolos de higiene"
                  {...register(`trainingGoals.${index}.topic` as const)}
                />
                <button
                  type="button"
                  className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-rose-400 hover:text-rose-300"
                  onClick={() => remove(index)}
                  aria-label="Eliminar objetivo"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {errors.trainingGoals && (
            <p className="text-xs text-rose-400">
              {errors.trainingGoals.root?.message ?? errors.trainingGoals.message}
            </p>
          )}
        </div>

        {feedback && (
          <p className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {feedback}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isSubmitting ? "Creando credenciales..." : "Registrar cuenta"}
        </button>
      </form>

      <aside className="grid gap-3 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-sm text-slate-300">
        <h2 className="text-base font-semibold text-slate-100">
          Buenas prácticas de onboarding
        </h2>
        <ul className="space-y-2">
          <li>Asignación de roles con principio de menor privilegio (HU8).</li>
          <li>Registro de objetivos de aprendizaje para seguimiento (HU9).</li>
          <li>
            Integración con la documentación técnica y operativa disponible (HU10).
          </li>
        </ul>
      </aside>
    </section>
  )
}
