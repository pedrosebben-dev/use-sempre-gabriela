interface CepResult { cep: string; street: string; neighborhood: string; city: string; state: string }

/** Busca endereço pelo CEP (ViaCEP, com BrasilAPI como reserva). */
export default defineCachedEventHandler(async (event): Promise<CepResult> => {
  const cep = onlyDigits(getRouterParam(event, 'cep') || '')
  if (cep.length !== 8) throw createError({ statusCode: 400, statusMessage: 'CEP inválido' })

  try {
    const r: any = await $fetch(`https://viacep.com.br/ws/${cep}/json/`, { timeout: 5000 })
    if (r.erro) throw createError({ statusCode: 404, statusMessage: 'CEP não encontrado' })
    return { cep, street: r.logradouro, neighborhood: r.bairro, city: r.localidade, state: r.uf }
  } catch (e: any) {
    if (e?.statusCode === 404) throw e
    const r: any = await $fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, { timeout: 5000 }).catch(() => null)
    if (!r) throw createError({ statusCode: 404, statusMessage: 'CEP não encontrado' })
    return { cep, street: r.street, neighborhood: r.neighborhood, city: r.city, state: r.state }
  }
}, { maxAge: 60 * 60 * 24, getKey: e => getRouterParam(e, 'cep') || '' })
