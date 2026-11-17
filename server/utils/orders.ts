import type { Order } from '#shared/types'

/** Persistência simples via Nitro storage (fs em ./.data/orders). Troque o driver por Redis/DB em produção. */
const store = () => useStorage<Order>('orders')

export async function saveOrder(order: Order) {
  await store().setItem(order.id, order)
  return order
}

export async function getOrder(id: string) {
  return store().getItem(id)
}

export async function findOrderByPaymentId(paymentId: string) {
  const keys = await store().getKeys()
  for (const k of keys) {
    const o = await store().getItem(k)
    if (o?.paymentId === paymentId) return o
  }
  return null
}

export function newOrderId() {
  const d = new Date()
  const stamp = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `SG${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}
