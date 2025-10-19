export type Role = "admin" | "staff" | "viewer"

export type User = {
  id: string
  name: string
  email: string
  role: Role
}

export type OrderStatus =
  | "recibido"
  | "preparando"
  | "en_camino"
  | "entregado"
  | "cancelado"

export type OrderItem = {
  id: string
  name: string
  quantity: number
  unitPrice: number
}

export type Order = {
  id: string
  customerName: string
  deliveryAddress: string
  items: OrderItem[]
  total: number
  paymentMethod: string
  notes?: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export type NotificationType = "pedido" | "inventario" | "pago" | "seguridad" | "entrenamiento"

export type Notification = {
  id: string
  title: string
  message: string
  timestamp: string
  type: NotificationType
  relatedOrderId?: string
}

export type InventoryItem = {
  id: string
  name: string
  stock: number
  minStock: number
  unit: string
  supplier: string
}

export type SalesReport = {
  id: string
  period: string
  orders: number
  revenue: number
  averageTicket: number
  topProduct: string
  createdAt: string
}

export type PaymentMethod = {
  id: string
  name: string
  description: string
  enabled: boolean
  settlementTime: string
  fees: string
}

export type PaymentRecord = {
  id: string
  orderId: string
  methodId: string
  amount: number
  status: "pendiente" | "aprobado" | "rechazado"
  processedAt: string
}

export type TrainingSession = {
  id: string
  title: string
  description: string
  scheduledAt: string
  durationMinutes: number
  completed: boolean
}

export type DocumentationResource = {
  id: string
  title: string
  description: string
  category: "tecnica" | "operativa" | "seguridad" | "pagos"
  url: string
  lastUpdated: string
}

export type OrderFormValues = {
  customerName: string
  deliveryAddress: string
  items: {
    name: string
    quantity: number
    unitPrice: number
  }[]
  paymentMethod: string
  notes?: string
}
