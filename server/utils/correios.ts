import type { ShippingOption, ShippingService } from '#shared/types'

/**
 * Integração com a API REST oficial dos Correios (https://cws.correios.com.br).
 *  - Autenticação: POST /token/v1/autentica/cartaopostagem  (Basic usuário:código de acesso)
 *  - Preço:        GET  /preco/v1/nacional/{produto}
 *  - Prazo:        GET  /prazo/v1/nacional/{produto}
 * Sem credenciais configuradas, cai numa tabela de estimativa por região (marcada como `estimated`).
 */
const API = 'https://api.correios.com.br'

export interface Package {
  weight: number // gramas
  length: number // cm
  width: number
  height: number
}

let tokenCache: { token: string; expiresAt: number } | null = null

async function getToken() {
  const cfg = useRuntimeConfig().correios
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.token

  const res = await $fetch<{ token: string; expiraEm: string }>(`${API}/token/v1/autentica/cartaopostagem`, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${cfg.usuario}:${cfg.codigoAcesso}`).toString('base64')
    },
    body: { numero: cfg.cartaoPostagem }
  })
  tokenCache = { token: res.token, expiresAt: new Date(res.expiraEm).getTime() }
  return res.token
}

export function correiosConfigured() {
  const c = useRuntimeConfig().correios
  return Boolean(c.usuario && c.codigoAcesso && c.cartaoPostagem)
}

/** Junta as peças numa caixa só respeitando os mínimos dos Correios (16×11×2 cm, 300 g). */
export function buildPackage(items: { weight: number; dimensions: { length: number; width: number; height: number }; quantity: number }[]): Package {
  let weight = 0
  let height = 0
  let length = 16
  let width = 11
  for (const it of items) {
    weight += it.weight * it.quantity
    height += it.dimensions.height * it.quantity
    length = Math.max(length, it.dimensions.length)
    width = Math.max(width, it.dimensions.width)
  }
  return {
    weight: Math.max(300, weight + 100), // +100 g da embalagem
    length,
    width,
    height: Math.min(100, Math.max(2, height))
  }
}

const parseBRL = (v: string | number) => typeof v === 'number' ? v : Number(String(v).replace(/\./g, '').replace(',', '.'))

async function quoteService(service: ShippingService, cepDestino: string, pkg: Package): Promise<ShippingOption> {
  const cfg = useRuntimeConfig().correios
  const code = service === 'PAC' ? cfg.produtoPac : cfg.produtoSedex
  const token = await getToken()
  const headers = { Authorization: `Bearer ${token}` }

  const [preco, prazo] = await Promise.all([
    $fetch<{ pcFinal: string }>(`${API}/preco/v1/nacional/${code}`, {
      headers,
      query: {
        cepOrigem: cfg.cepOrigem,
        cepDestino,
        psObjeto: pkg.weight,
        tpObjeto: 2, // pacote
        comprimento: pkg.length,
        largura: pkg.width,
        altura: pkg.height,
        ...(cfg.contrato ? { nuContrato: cfg.contrato } : {}),
        ...(cfg.dr ? { nuDR: cfg.dr } : {})
      }
    }),
    $fetch<{ prazoEntrega: number; dataMaxima?: string }>(`${API}/prazo/v1/nacional/${code}`, {
      headers,
      query: { cepOrigem: cfg.cepOrigem, cepDestino }
    })
  ])

  return {
    service,
    code,
    name: service === 'PAC' ? 'PAC' : 'SEDEX',
    price: round2(parseBRL(preco.pcFinal)),
    days: prazo.prazoEntrega + 1, // +1 dia útil de manuseio da loja
    deadline: prazo.dataMaxima,
    estimated: false
  }
}

/**
 * Tabela de estimativa (modo demonstração). Usa a distância entre o 1º dígito do CEP de origem e
 * destino como aproximação de região. Substituída automaticamente quando as credenciais existem.
 */
function estimate(service: ShippingService, cepDestino: string, pkg: Package): ShippingOption {
  const cfg = useRuntimeConfig().correios
  const dist = Math.abs(Number(cfg.cepOrigem[0]) - Number(cepDestino[0]))
  const kg = Math.ceil(pkg.weight / 1000)
  const base = service === 'PAC' ? 19.9 + dist * 3.4 : 29.9 + dist * 5.8
  const perKg = service === 'PAC' ? 4.5 : 8.9
  const days = service === 'PAC' ? 4 + dist * 1.2 : 1 + dist * 0.6
  return {
    service,
    code: service === 'PAC' ? cfg.produtoPac : cfg.produtoSedex,
    name: service,
    price: round2(base + (kg - 1) * perKg),
    days: Math.round(days) + 1,
    estimated: true
  }
}

export async function quoteShipping(cepDestino: string, pkg: Package): Promise<ShippingOption[]> {
  const cep = onlyDigits(cepDestino)
  if (cep.length !== 8) throw createError({ statusCode: 400, statusMessage: 'CEP inválido' })

  const services: ShippingService[] = ['PAC', 'SEDEX']
  if (!correiosConfigured()) return services.map(s => estimate(s, cep, pkg))

  const results = await Promise.allSettled(services.map(s => quoteService(s, cep, pkg)))
  const ok = results.flatMap(r => (r.status === 'fulfilled' ? [r.value] : []))
  if (!ok.length) {
    console.error('[correios] falha na cotação', results)
    throw createError({ statusCode: 502, statusMessage: 'Não foi possível calcular o frete com os Correios agora. Tente novamente.' })
  }
  return ok
}

/** Aplica a regra de frete grátis no PAC. */
export function applyFreeShipping(options: ShippingOption[], subtotal: number) {
  if (subtotal < FREE_SHIPPING_FROM) return options
  return options.map(o => (o.service === 'PAC' ? { ...o, price: 0 } : o))
}
