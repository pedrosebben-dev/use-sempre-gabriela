/**
 * Tokenização de cartão com o MercadoPago.js v2 (Core Methods).
 * O número do cartão NUNCA vai para o nosso servidor: o SDK troca os dados por um token
 * de uso único, e só o token é enviado para /api/orders.
 * Sem chave pública configurada, devolve um token fictício (modo demonstração).
 */
declare global {
  interface Window { MercadoPago?: any }
}

let sdkPromise: Promise<any> | null = null

function loadSdk(publicKey: string) {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise((resolve, reject) => {
    if (window.MercadoPago) return resolve(new window.MercadoPago(publicKey, { locale: 'pt-BR' }))
    const s = document.createElement('script')
    s.src = 'https://sdk.mercadopago.com/js/v2'
    s.onload = () => resolve(new window.MercadoPago(publicKey, { locale: 'pt-BR' }))
    s.onerror = () => { sdkPromise = null; reject(new Error('Falha ao carregar Mercado Pago')) }
    document.head.appendChild(s)
  })
  return sdkPromise
}

export interface CardInput {
  number: string
  holder: string
  expiry: string // MM/AA
  cvv: string
  cpf: string
}

export function detectBrand(number: string) {
  const n = onlyDigits(number)
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'master'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^(606282|3841)/.test(n)) return 'hipercard'
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n)) return 'elo'
  return ''
}

export function useMercadoPago() {
  const { public: pub } = useRuntimeConfig()
  const publicKey = pub.mercadoPagoPublicKey as string
  const demo = !publicKey

  async function tokenize(card: CardInput) {
    const number = onlyDigits(card.number)
    const [mm, yy] = card.expiry.split('/')
    if (demo) {
      await new Promise(r => setTimeout(r, 600))
      return { token: `demo_${Date.now()}`, paymentMethodId: detectBrand(number) || 'visa', issuerId: undefined as string | undefined }
    }

    const mp = await loadSdk(publicKey)
    const bin = number.slice(0, 8)
    const methods = await mp.getPaymentMethods({ bin })
    const method = methods?.results?.[0]
    if (!method) throw new Error('Cartão não reconhecido. Confira o número.')

    const token = await mp.createCardToken({
      cardNumber: number,
      cardholderName: card.holder,
      cardExpirationMonth: mm,
      cardExpirationYear: `20${yy}`,
      securityCode: card.cvv,
      identificationType: 'CPF',
      identificationNumber: onlyDigits(card.cpf)
    })

    return {
      token: token.id as string,
      paymentMethodId: method.id as string,
      issuerId: method.issuer?.id ? String(method.issuer.id) : undefined
    }
  }

  return { tokenize, demo }
}
