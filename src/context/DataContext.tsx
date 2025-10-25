import React, { createContext, useContext, useMemo, useState } from "react"
import {
  CheckoutPayload,
  DocumentationResource,
  InventoryItem,
  Notification,
  NotificationType,
  Order,
  OrderFormValues,
  OrderItem,
  OrderStatus,
  PaymentGatewayProvider,
  PaymentMethod,
  PaymentRecord,
  PaymentSandboxConfig,
  PaymentTransactionStatus,
  SalesReport,
  TransactionLogEntry,
  TrainingSession,
} from "@/types"
import { createId } from "@/utils/id"
import { executeCheckout, validateCheckoutPayload } from "@/services/checkout"

const ORDER_STATUS_FLOW: OrderStatus[] = [
  "recibido",
  "preparando",
  "en_camino",
  "entregado",
]

function getNextStatus(status: OrderStatus): OrderStatus {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(status)
  if (currentIndex === -1 || currentIndex === ORDER_STATUS_FLOW.length - 1) {
    return status
  }
  return ORDER_STATUS_FLOW[currentIndex + 1]
}

type DataContextType = {
  orders: Order[]
  notifications: Notification[]
  inventory: InventoryItem[]
  salesReports: SalesReport[]
  paymentMethods: PaymentMethod[]
  paymentHistory: PaymentRecord[]
  transactionLog: TransactionLogEntry[]
  paymentConfig: PaymentSandboxConfig
  trainingSessions: TrainingSession[]
  documentation: DocumentationResource[]
  addOrder: (values: OrderFormValues) => Promise<{
    success: boolean
    order?: Order
    error?: string
  }>
  updateOrderStatus: (orderId: string, status?: OrderStatus) => void
  adjustInventory: (itemId: string, delta: number, orderId?: string) => void
  togglePaymentMethod: (methodId: string) => void
  recordPayment: (
    orderId: string,
    methodId: string,
    amount: number,
    status?: PaymentRecord["status"],
    reference?: string,
  ) => void
  markTrainingCompleted: (sessionId: string) => void
  switchPaymentProvider: (provider: PaymentGatewayProvider) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialOrders: Order[] = [
  {
    id: "ORD-1001",
    customerName: "María López",
    deliveryAddress: "Calle 5 #123",
    items: [
      {
        id: "menu-arepa",
        name: "Arepa Reina Pepiada",
        quantity: 2,
        unitPrice: 4.5,
        inventoryId: "inv-harina",
      },
      {
        id: "menu-jugo",
        name: "Jugo de parchita",
        quantity: 2,
        unitPrice: 2.5,
        inventoryId: "inv-jugo",
      },
    ],
    total: 14,
    paymentMethod: "tarjeta",
    status: "en_camino",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: "Entregar con salsas aparte",
  },
  {
    id: "ORD-1002",
    customerName: "José Pérez",
    deliveryAddress: "Av. Libertador #89",
    items: [
      {
        id: "menu-pabellon",
        name: "Pabellón criollo",
        quantity: 1,
        unitPrice: 9.5,
        inventoryId: "inv-carne",
      },
    ],
    total: 9.5,
    paymentMethod: "efectivo",
    status: "preparando",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const initialInventory: InventoryItem[] = [
  {
    id: "inv-harina",
    name: "Harina PAN",
    stock: 25,
    reserved: 4,
    minStock: 15,
    unit: "kg",
    supplier: "Alimentos Polar",
  },
  {
    id: "inv-queso",
    name: "Queso blanco",
    stock: 12,
    reserved: 1,
    minStock: 10,
    unit: "kg",
    supplier: "Lácteos Andinos",
  },
  {
    id: "inv-carne",
    name: "Carne mechada",
    stock: 8,
    reserved: 1,
    minStock: 6,
    unit: "kg",
    supplier: "Cárnicos Caribe",
  },
  {
    id: "inv-jugo",
    name: "Pulpa de parchita",
    stock: 18,
    reserved: 2,
    minStock: 10,
    unit: "l",
    supplier: "Jugos del Valle",
  },
]

const initialNotifications: Notification[] = [
  {
    id: "noti-1",
    title: "Pedido en camino",
    message: "El pedido ORD-1001 salió a reparto.",
    timestamp: new Date().toISOString(),
    type: "pedido",
    relatedOrderId: "ORD-1001",
  },
  {
    id: "noti-2",
    title: "Stock bajo",
    message: "El queso blanco se encuentra por debajo del stock mínimo.",
    timestamp: new Date().toISOString(),
    type: "inventario",
  },
]

const initialPaymentMethods: PaymentMethod[] = [
  {
    id: "tarjeta",
    name: "Tarjeta de crédito",
    description: "Procesada por proveedor PCI DSS",
    enabled: true,
    settlementTime: "24h",
    fees: "3% + 0.30$",
  },
  {
    id: "efectivo",
    name: "Pago en efectivo",
    description: "Cobro contra entrega con código seguro",
    enabled: true,
    settlementTime: "Inmediato",
    fees: "Sin comisión",
  },
  {
    id: "transferencia",
    name: "Transferencia bancaria",
    description: "Verificación manual por el equipo administrativo",
    enabled: false,
    settlementTime: "48h",
    fees: "1%",
  },
]

const initialReports: SalesReport[] = [
  {
    id: "report-abril",
    period: "Abril 2024",
    orders: 420,
    revenue: 5800,
    averageTicket: 13.8,
    topProduct: "Arepa Reina Pepiada",
    createdAt: new Date().toISOString(),
  },
  {
    id: "report-mayo",
    period: "Mayo 2024",
    orders: 468,
    revenue: 6450,
    averageTicket: 13.7,
    topProduct: "Tequeños artesanales",
    createdAt: new Date().toISOString(),
  },
]

const initialTraining: TrainingSession[] = [
  {
    id: "training-higiene",
    title: "Buenas prácticas de manipulación",
    description: "Protocolos de inocuidad y limpieza de estaciones de trabajo.",
    scheduledAt: new Date().toISOString(),
    durationMinutes: 120,
    completed: false,
  },
  {
    id: "training-plataforma",
    title: "Uso de la plataforma de pedidos",
    description: "Gestión eficiente de pedidos, inventario y reportes.",
    scheduledAt: new Date().toISOString(),
    durationMinutes: 90,
    completed: true,
  },
]

const initialDocs: DocumentationResource[] = [
  {
    id: "doc-api",
    title: "Guía de integración API",
    description: "Endpoints para la sincronización de pedidos y pagos.",
    category: "tecnica",
    url: "https://docs.monchita.com/api",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "doc-onboarding",
    title: "Manual de capacitación",
    description: "Pasos para incorporar nuevo personal y flujos de trabajo.",
    category: "operativa",
    url: "https://docs.monchita.com/onboarding",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "doc-seguridad",
    title: "Checklist de seguridad",
    description: "Controles técnicos, auditorías y plan de respuesta a incidentes.",
    category: "seguridad",
    url: "https://docs.monchita.com/security",
    lastUpdated: new Date().toISOString(),
  },
]

const SANDBOX_CONFIGS: Record<
  PaymentGatewayProvider,
  PaymentSandboxConfig
> = {
  stripe: {
    provider: "stripe",
    publicKey: "pk_test_monchita_stripe",
    sandboxUrl: "https://api.sandbox.stripe.com/v1",
    currency: "USD",
    retries: 3,
    retryDelayMs: 1200,
  },
  mercadopago: {
    provider: "mercadopago",
    publicKey: "TEST-1234567890-MP",
    sandboxUrl: "https://api.mercadopago.com/sandbox",
    currency: "USD",
    retries: 2,
    retryDelayMs: 1500,
  },
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications,
  )
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory)
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(initialPaymentMethods)
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [salesReports] = useState<SalesReport[]>(initialReports)
  const [trainingSessions, setTrainingSessions] =
    useState<TrainingSession[]>(initialTraining)
  const [documentation] = useState<DocumentationResource[]>(initialDocs)
  const [transactionLog, setTransactionLog] = useState<TransactionLogEntry[]>([])
  const [paymentConfig, setPaymentConfig] = useState<PaymentSandboxConfig>(
    SANDBOX_CONFIGS.stripe,
  )

  function appendNotification(
    title: string,
    message: string,
    type: NotificationType,
    relatedOrderId?: string,
  ) {
    setNotifications((prev) => [
      {
        id: createId("noti"),
        title,
        message,
        timestamp: new Date().toISOString(),
        type,
        relatedOrderId,
      },
      ...prev,
    ])
  }

  function calculateOrderTotal(items: OrderItem[]) {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0)
  }

  function matchInventoryForItem(item: {
    name: string
    inventoryId?: string
  }) {
    return (
      inventory.find((invItem) => invItem.id === item.inventoryId) ??
      inventory.find((invItem) =>
        item.name
          .toLowerCase()
          .includes(invItem.name.toLowerCase().split(" ")[0]),
      )
    )
  }

  function mutateInventory(
    itemIdentifier: string,
    {
      stockDelta = 0,
      reservedDelta = 0,
    }: { stockDelta?: number; reservedDelta?: number },
    orderId?: string,
  ) {
    setInventory((prev) => {
      const nextInventory = prev.map((item) => {
        if (item.id === itemIdentifier || item.name === itemIdentifier) {
          const nextStock = Math.max(0, item.stock + stockDelta)
          const nextReserved = Math.max(0, item.reserved + reservedDelta)
          const safeReserved = Math.min(nextReserved, nextStock)
          const available = nextStock - safeReserved
          if (available <= item.minStock) {
            appendNotification(
              "Reabastecimiento sugerido",
              `${item.name} está por debajo del stock recomendado.`,
              "inventario",
            )
          }
          return { ...item, stock: nextStock, reserved: safeReserved }
        }
        return item
      })
      return nextInventory
    })

    if (orderId && (stockDelta !== 0 || reservedDelta !== 0)) {
      const action =
        reservedDelta > 0
          ? "Se reservaron insumos"
          : stockDelta < 0
          ? "Se descontó inventario"
          : "Inventario actualizado"
      appendNotification(
        "Control de inventario",
        `${action} para el pedido ${orderId}.`,
        "inventario",
        orderId,
      )
    }
  }

  function adjustInventory(
    itemIdentifier: string,
    delta: number,
    orderId?: string,
  ) {
    mutateInventory(itemIdentifier, { stockDelta: delta }, orderId)
  }

  function reserveInventory(order: Order) {
    order.items.forEach((item) => {
      if (!item.inventoryId) return
      mutateInventory(item.inventoryId, { reservedDelta: item.quantity }, order.id)
    })
  }

  function releaseReservation(order: Order) {
    order.items.forEach((item) => {
      if (!item.inventoryId) return
      mutateInventory(
        item.inventoryId,
        { reservedDelta: -item.quantity },
        order.id,
      )
    })
  }

  function consumeReservation(order: Order) {
    order.items.forEach((item) => {
      if (!item.inventoryId) return
      mutateInventory(
        item.inventoryId,
        { stockDelta: -item.quantity, reservedDelta: -item.quantity },
        order.id,
      )
    })
  }

  function appendTransactionEntry(
    entry: Omit<TransactionLogEntry, "id" | "createdAt">,
  ) {
    setTransactionLog((prev) => [
      {
        ...entry,
        id: createId("txn"),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  async function addOrder(values: OrderFormValues) {
    const mappedItems = values.items.map((item) => ({
      original: item,
      inventory: matchInventoryForItem(item),
    }))

    const insufficient = mappedItems.filter(({ original, inventory }) => {
      if (!inventory) return true
      const available = inventory.stock - inventory.reserved
      return available < original.quantity
    })

    if (insufficient.length) {
      const productName = insufficient[0].original.name
      return {
        success: false,
        error: `No hay stock suficiente para ${productName}.`,
      }
    }

    const items: OrderItem[] = mappedItems.map(({ original, inventory }) => ({
      id: createId("order-item"),
      name: original.name,
      quantity: original.quantity,
      unitPrice: original.unitPrice,
      inventoryId: inventory?.id,
    }))

    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 9000 + 1000)}`,
      customerName: values.customerName,
      deliveryAddress: values.deliveryAddress,
      items,
      total: calculateOrderTotal(items),
      paymentMethod: values.paymentMethod,
      notes: values.notes,
      status: "recibido",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const payload: CheckoutPayload = {
      orderId: newOrder.id,
      amount: newOrder.total,
      currency: paymentConfig.currency,
      items: newOrder.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      customerName: newOrder.customerName,
      paymentMethod: newOrder.paymentMethod,
    }

    const validationErrors = validateCheckoutPayload(payload)
    if (validationErrors.length) {
      return {
        success: false,
        error: validationErrors.join(". "),
      }
    }

    const checkoutResult = await executeCheckout(payload, paymentConfig)

    appendTransactionEntry({
      orderId: newOrder.id,
      provider: paymentConfig.provider,
      amount: newOrder.total,
      attempts: checkoutResult.attempts,
      status: checkoutResult.status,
      error: checkoutResult.error,
      reference: checkoutResult.reference,
    })

    if (!checkoutResult.success) {
      appendNotification(
        "Pago rechazado",
        `El pedido ${newOrder.id} fue detenido por la pasarela (${checkoutResult.error ?? "error desconocido"}).`,
        "pago",
        newOrder.id,
      )
      return {
        success: false,
        error:
          checkoutResult.error ?? "No se pudo confirmar el pago en el sandbox.",
      }
    }

    setOrders((prev) => [newOrder, ...prev])
    reserveInventory(newOrder)
    appendNotification(
      "Nuevo pedido recibido",
      `Se registró el pedido ${newOrder.id} para ${newOrder.customerName}.`,
      "pedido",
      newOrder.id,
    )
    appendNotification(
      "Pago aprobado",
      `El pago del pedido ${newOrder.id} fue confirmado en ${paymentConfig.provider}.`,
      "pago",
      newOrder.id,
    )
    recordPayment(
      newOrder.id,
      newOrder.paymentMethod,
      newOrder.total,
      "aprobado",
      checkoutResult.reference,
    )

    return { success: true, order: newOrder }
  }

  function updateOrderStatus(orderId: string, nextStatus?: OrderStatus) {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== orderId) return order
        const previousStatus = order.status
        const status = nextStatus ?? getNextStatus(order.status)
        if (status === previousStatus) {
          return order
        }

        if (status === "cancelado" && previousStatus !== "cancelado") {
          releaseReservation(order)
          appendNotification(
            "Pedido cancelado",
            `Se liberó la reserva de inventario para el pedido ${order.id}.`,
            "inventario",
            order.id,
          )
        }

        if (status === "entregado" && previousStatus !== "entregado") {
          consumeReservation(order)
        }

        appendNotification(
          "Estado actualizado",
          `El pedido ${order.id} cambió a estado "${status}".`,
          "pedido",
          order.id,
        )

        return {
          ...order,
          status,
          updatedAt: new Date().toISOString(),
        }
      })
      return updated
    })
  }

  function togglePaymentMethod(methodId: string) {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === methodId
          ? { ...method, enabled: !method.enabled }
          : method,
      ),
    )
  }

  function recordPayment(
    orderId: string,
    methodId: string,
    amount: number,
    status: PaymentRecord["status"] = "aprobado",
    reference?: string,
  ) {
    const record: PaymentRecord = {
      id: createId("payment"),
      orderId,
      methodId,
      amount,
      status,
      processedAt: new Date().toISOString(),
      reference,
    }
    setPaymentHistory((prev) => [record, ...prev])
    appendNotification(
      status === "aprobado" ? "Pago registrado" : "Pago rechazado",
      `$${amount.toFixed(2)} · ${
        status === "aprobado" ? "Aprobado" : "Rechazado"
      } (${methodId}).`,
      "pago",
      orderId,
    )
  }

  function switchPaymentProvider(provider: PaymentGatewayProvider) {
    const nextConfig = SANDBOX_CONFIGS[provider]
    setPaymentConfig(nextConfig)
    appendNotification(
      "Sandbox actualizado",
      `La pasarela de pago cambió a ${provider.toUpperCase()}.`,
      "pago",
    )
  }

  function markTrainingCompleted(sessionId: string) {
    setTrainingSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, completed: true }
          : session,
      ),
    )
    appendNotification(
      "Capacitación completada",
      "Un miembro del equipo finalizó una sesión de formación.",
      "entrenamiento",
    )
  }

  const value = useMemo(
    () => ({
      orders,
      notifications,
      inventory,
      salesReports,
      paymentMethods,
      paymentHistory,
      transactionLog,
      paymentConfig,
      trainingSessions,
      documentation,
      addOrder,
      updateOrderStatus,
      adjustInventory,
      togglePaymentMethod,
      recordPayment,
      markTrainingCompleted,
      switchPaymentProvider,
    }),
    [
      orders,
      notifications,
      inventory,
      salesReports,
      paymentMethods,
      paymentHistory,
      transactionLog,
      paymentConfig,
      trainingSessions,
      documentation,
      recordPayment,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData debe usarse dentro de un DataProvider")
  }
  return context
}

