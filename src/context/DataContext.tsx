import React, { createContext, useContext, useMemo, useState } from "react"
import {
  DocumentationResource,
  InventoryItem,
  Notification,
  NotificationType,
  Order,
  OrderFormValues,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentRecord,
  SalesReport,
  TrainingSession,
} from "@/types"
import { createId } from "@/utils/id"

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
  trainingSessions: TrainingSession[]
  documentation: DocumentationResource[]
  addOrder: (values: OrderFormValues) => void
  updateOrderStatus: (orderId: string, status?: OrderStatus) => void
  adjustInventory: (itemId: string, delta: number, orderId?: string) => void
  togglePaymentMethod: (methodId: string) => void
  recordPayment: (orderId: string, methodId: string, amount: number) => void
  markTrainingCompleted: (sessionId: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialOrders: Order[] = [
  {
    id: "ORD-1001",
    customerName: "María López",
    deliveryAddress: "Calle 5 #123",
    items: [
      { id: "menu-arepa", name: "Arepa Reina Pepiada", quantity: 2, unitPrice: 4.5 },
      { id: "menu-jugo", name: "Jugo de parchita", quantity: 2, unitPrice: 2.5 },
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
    items: [{ id: "menu-pabellon", name: "Pabellón criollo", quantity: 1, unitPrice: 9.5 }],
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
    minStock: 15,
    unit: "kg",
    supplier: "Alimentos Polar",
  },
  {
    id: "inv-queso",
    name: "Queso blanco",
    stock: 12,
    minStock: 10,
    unit: "kg",
    supplier: "Lácteos Andinos",
  },
  {
    id: "inv-carne",
    name: "Carne mechada",
    stock: 8,
    minStock: 6,
    unit: "kg",
    supplier: "Cárnicos Caribe",
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

  function adjustInventory(
    itemIdentifier: string,
    delta: number,
    orderId?: string,
  ) {
    setInventory((prev) => {
      const nextInventory = prev.map((item) => {
        if (item.id === itemIdentifier || item.name === itemIdentifier) {
          const newStock = Math.max(0, item.stock + delta)
          if (newStock <= item.minStock) {
            appendNotification(
              "Reabastecimiento sugerido",
              `${item.name} está por debajo del stock recomendado.`,
              "inventario",
            )
          }
          return { ...item, stock: newStock }
        }
        return item
      })
      return nextInventory
    })

    if (delta < 0 && orderId) {
      appendNotification(
        "Control de inventario",
        `Se descontó inventario para el pedido ${orderId}.`,
        "inventario",
        orderId,
      )
    }
  }

  function addOrder(values: OrderFormValues) {
    const items: OrderItem[] = values.items.map((item) => ({
      id: createId("order-item"),
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
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

    setOrders((prev) => [newOrder, ...prev])
    appendNotification(
      "Nuevo pedido recibido",
      `Se registró el pedido ${newOrder.id} para ${newOrder.customerName}.`,
      "pedido",
      newOrder.id,
    )

    values.items.forEach((item) => {
      const inventoryMatch = inventory.find((invItem) =>
        item.name.toLowerCase().includes(invItem.name.toLowerCase().split(" ")[0]),
      )
      adjustInventory(inventoryMatch?.id ?? item.name, -item.quantity, newOrder.id)
    })
  }

  function updateOrderStatus(orderId: string, nextStatus?: OrderStatus) {
    setOrders((prev) => {
      const updated = prev.map((order) => {
        if (order.id !== orderId) return order
        const status = nextStatus ?? getNextStatus(order.status)
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

  function recordPayment(orderId: string, methodId: string, amount: number) {
    const record: PaymentRecord = {
      id: createId("payment"),
      orderId,
      methodId,
      amount,
      status: "aprobado",
      processedAt: new Date().toISOString(),
    }
    setPaymentHistory((prev) => [record, ...prev])
    appendNotification(
      "Pago registrado",
      `Se procesó un pago de $${amount.toFixed(2)} para el pedido ${orderId}.`,
      "pago",
      orderId,
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
      trainingSessions,
      documentation,
      addOrder,
      updateOrderStatus,
      adjustInventory,
      togglePaymentMethod,
      recordPayment,
      markTrainingCompleted,
    }),
    [
      orders,
      notifications,
      inventory,
      salesReports,
      paymentMethods,
      paymentHistory,
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

