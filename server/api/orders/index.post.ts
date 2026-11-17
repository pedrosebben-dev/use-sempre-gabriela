import type { CreateOrderBody, Order } from '#shared/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateOrderBody>(event)
  const { customer, address } = body

  // ---- validações ----
  if (!customer?.name?.trim() || customer.name.trim().split(/\s+/).length < 2)
    throw createError({ statusCode: 400, statusMessage: 'Informe nome e sobrenome' })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email || ''))
    throw createError({ statusCode: 400, statusMessage: 'E-mail inválido' })
  if (!isValidCPF(customer.cpf)) throw createError({ statusCode: 400, statusMessage: 'CPF inválido' })
  if (!address?.street || !address.number || !address.city || !address.state)
    throw createError({ statusCode: 400, statusMessage: 'Endereço incompleto' })
  if (!['pix', 'card', 'boleto'].includes(body.paymentMethod))
    throw createError({ statusCode: 400, statusMessage: 'Forma de pagamento inválida' })

  // ---- preços e frete recalculados no servidor ----
  const { lines, subtotal, pkg } = resolveCart(body.items)
  const options = applyFreeShipping(await quoteShipping(address.cep, pkg), subtotal)
  const shipping = options.find(o => o.service === body.shippingService)
  if (!shipping) throw createError({ statusCode: 400, statusMessage: 'Frete indisponível para este CEP' })

  const discount = body.paymentMethod === 'pix' ? round2(subtotal * PIX_DISCOUNT) : 0
  const total = round2(subtotal - discount + shipping.price)

  if (body.paymentMethod === 'card') {
    const max = maxInstallmentsFor(total)
    if (!body.card || body.card.installments < 1 || body.card.installments > max)
      throw createError({ statusCode: 400, statusMessage: `Parcelamento máximo: ${max}x` })
  }

  const demo = !mercadoPagoConfigured()
  let order: Order = {
    id: newOrderId(),
    createdAt: new Date().toISOString(),
    status: 'pending',
    customer: { ...customer, cpf: onlyDigits(customer.cpf), phone: onlyDigits(customer.phone) },
    address: { ...address, cep: onlyDigits(address.cep) },
    lines, shipping, subtotal, discount, total,
    paymentMethod: body.paymentMethod,
    installments: body.card?.installments,
    demo
  }

  order = demo ? demoPayment(order) : await createPayment(order, body.card)
  await saveOrder(order)
  return order
})
