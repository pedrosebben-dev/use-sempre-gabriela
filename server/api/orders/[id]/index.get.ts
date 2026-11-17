export default defineEventHandler(async (event) => {
  const order = await getOrder(getRouterParam(event, 'id') || '')
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  // Se ainda está pendente, consulta o Mercado Pago (útil em dev, onde o webhook não chega)
  if (!order.demo && order.paymentId && (order.status === 'pending' || order.status === 'in_process')) {
    try {
      applyPayment(order, await getPayment(order.paymentId))
      await saveOrder(order)
    } catch (e) {
      console.warn('[orders] não foi possível atualizar status', e)
    }
  }
  return order
})
