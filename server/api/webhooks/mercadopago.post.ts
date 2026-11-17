/** Recebe notificações de pagamento do Mercado Pago e atualiza o pedido. */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ type?: string; action?: string; data?: { id?: string } }>(event)
  const q = getQuery(event)
  const dataId = String(q['data.id'] || body?.data?.id || '')
  const type = String(q.type || body?.type || '')

  if (type !== 'payment' || !dataId) return { ok: true }

  if (!verifyWebhookSignature(getHeader(event, 'x-signature'), getHeader(event, 'x-request-id'), dataId)) {
    throw createError({ statusCode: 401, statusMessage: 'Assinatura inválida' })
  }

  const payment = await getPayment(dataId)
  const order = (payment.external_reference && (await getOrder(payment.external_reference))) || (await findOrderByPaymentId(dataId))
  if (order) {
    applyPayment(order, payment)
    await saveOrder(order)
    // TODO: enviar e-mail de confirmação / gerar etiqueta de postagem (Correios Pré-postagem)
  }
  return { ok: true }
})
