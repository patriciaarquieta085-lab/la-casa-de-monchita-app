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
  inventoryId?: string
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

export type NotificationType =
  | "pedido"
  | "inventario"
  | "pago"
  | "seguridad"
  | "entrenamiento"

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
  reserved: number
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

export type PaymentTransactionStatus =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "reintentando"

export type PaymentRecord = {
  id: string
  orderId: string
  methodId: string
  amount: number
  status: "pendiente" | "aprobado" | "rechazado"
  processedAt: string
  reference?: string
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

export type PaymentGatewayProvider = "stripe" | "mercadopago"

export type PaymentSandboxConfig = {
  provider: PaymentGatewayProvider
  publicKey: string
  sandboxUrl: string
  currency: string
  retries: number
  retryDelayMs: number
}

export type CheckoutPayload = {
  orderId: string
  amount: number
  currency: string
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
  }>
  customerName: string
  paymentMethod: string
}

export type TransactionLogEntry = {
  id: string
  orderId: string
  provider: PaymentGatewayProvider
  amount: number
  attempts: number
  status: PaymentTransactionStatus
  error?: string
  createdAt: string
  reference?: string
}
