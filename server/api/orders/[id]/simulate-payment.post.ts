/** Só no modo demonstração: marca um pedido Pix/boleto como pago. */
export default defineEventHandler(async (event) => {
  const order = await getOrder(getRouterParam(event, 'id') || '')
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  if (!order.demo) throw createError({ statusCode: 403, statusMessage: 'Disponível apenas no modo demonstração' })
  order.status = 'approved'
  order.statusDetail = 'accredited'
  return saveOrder(order)
})
