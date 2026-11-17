export default defineEventHandler((event) => {
  const product = findProduct(getRouterParam(event, 'slug') || '')
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  return product
})
