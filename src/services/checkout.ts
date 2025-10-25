import {
  CheckoutPayload,
  PaymentSandboxConfig,
  PaymentTransactionStatus,
} from "@/types"

const NETWORK_ERROR_RATE = 0.25
const DECLINE_RATE = 0.15

function randomDelay(min = 400, max = 1100) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function createReference(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10).toUpperCase()}`
}

export function validateCheckoutPayload(payload: CheckoutPayload): string[] {
  const errors: string[] = []
  if (!payload.orderId) {
    errors.push("El pedido no tiene identificador")
  }
  if (!payload.amount || payload.amount <= 0) {
    errors.push("El monto del pedido debe ser mayor a 0")
  }
  if (!payload.items.length) {
    errors.push("El pedido debe contener productos")
  }
  if (!payload.customerName.trim()) {
    errors.push("El nombre del cliente es obligatorio")
  }
  if (!payload.paymentMethod.trim()) {
    errors.push("Debes seleccionar un método de pago")
  }
  return errors
}

async function mockGatewayCall(
  payload: CheckoutPayload,
  config: PaymentSandboxConfig,
  attempt: number,
) {
  await new Promise((resolve) => setTimeout(resolve, randomDelay()))

  if (Math.random() < NETWORK_ERROR_RATE) {
    throw new Error(
      `Fallo de red en ${config.provider} (intento ${attempt}). Intenta nuevamente.`,
    )
  }

  if (Math.random() < DECLINE_RATE) {
    return {
      status: "rechazado" as PaymentTransactionStatus,
      reference: createReference(config.provider === "stripe" ? "ST" : "MP"),
      error: "La pasarela rechazó la transacción",
    }
  }

  return {
    status: "aprobado" as PaymentTransactionStatus,
    reference: createReference(config.provider === "stripe" ? "ST" : "MP"),
  }
}

export async function executeCheckout(
  payload: CheckoutPayload,
  config: PaymentSandboxConfig,
) {
  const errors = validateCheckoutPayload(payload)
  if (errors.length) {
    return {
      success: false,
      attempts: 0,
      status: "rechazado" as PaymentTransactionStatus,
      error: errors.join(". "),
    }
  }

  let attempt = 0
  let lastError: string | undefined

  while (attempt < config.retries) {
    attempt += 1
    try {
      const result = await mockGatewayCall(payload, config, attempt)
      if (result.status === "aprobado") {
        return {
          success: true,
          attempts: attempt,
          status: result.status,
          reference: result.reference,
        }
      }

      lastError = result.error
      return {
        success: false,
        attempts: attempt,
        status: result.status,
        reference: result.reference,
        error: result.error,
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error)
      if (attempt < config.retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.retryDelayMs ?? 1000),
        )
      }
    }
  }

  return {
    success: false,
    attempts: attempt,
    status: "rechazado" as PaymentTransactionStatus,
    error: lastError ?? "Error desconocido al procesar el pago",
  }
}
