export type Category = 'florais' | 'conchas' | 'mediterraneo' | 'lisos'

export interface ProductVariant {
  sku: string
  color: string
  colorHex: string
  size: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'U'
  stock: number
}

export interface Product {
  id: string
  slug: string
  name: string
  category: Category
  description: string
  details: string[]
  price: number          // em reais
  compareAtPrice?: number
  /** true só quando a loja confirmou nome, preço, tamanhos e estoque. Sem isso não vende em produção. */
  confirmed: boolean
  /** URLs das fotos (em /public/produtos/...). Vazio = mostra placeholder. */
  images: string[]
  /** Peso em gramas e dimensões da peça embalada (cm) — usados no frete. */
  weight: number
  dimensions: { length: number; width: number; height: number }
  tags: string[]
  isNew?: boolean
  isBestSeller?: boolean
  variants: ProductVariant[]
}

export interface CartItem {
  productId: string
  sku: string
  quantity: number
}

export type ShippingService = 'PAC' | 'SEDEX'

export interface ShippingOption {
  service: ShippingService
  code: string
  name: string
  price: number
  days: number
  deadline?: string
  /** true quando calculado pela tabela de estimativa (sem token do Melhor Envio). */
  estimated: boolean
}

export interface Address {
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface Customer {
  name: string
  email: string
  cpf: string
  phone: string
}

export type PaymentMethod = 'pix' | 'card' | 'boleto'

export interface CardPaymentData {
  token: string
  paymentMethodId: string
  issuerId?: string
  installments: number
}

export interface CreateOrderBody {
  items: CartItem[]
  customer: Customer
  address: Address
  shippingService: ShippingService
  paymentMethod: PaymentMethod
  card?: CardPaymentData
}

export type OrderStatus = 'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled'

export interface OrderLine {
  productId: string
  sku: string
  name: string
  color: string
  size: string
  unitPrice: number
  quantity: number
}

export interface Order {
  id: string
  createdAt: string
  status: OrderStatus
  statusDetail?: string
  customer: Customer
  address: Address
  lines: OrderLine[]
  shipping: ShippingOption
  subtotal: number
  discount: number
  total: number
  paymentMethod: PaymentMethod
  installments?: number
  paymentId?: string
  demo: boolean
  pix?: { qrCode: string; qrCodeBase64?: string; expiresAt?: string }
  boleto?: { url: string; barcode?: string; expiresAt?: string }
}
