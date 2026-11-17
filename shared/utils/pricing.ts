/** Regras comerciais da loja — usadas igualmente no navegador e no servidor. */
export const PIX_DISCOUNT = 0.05            // 5% off no Pix
export const FREE_SHIPPING_FROM = 399       // frete grátis (PAC) acima deste valor
export const MAX_INSTALLMENTS = 6           // até 6x sem juros
export const MIN_INSTALLMENT_VALUE = 50     // parcela mínima

export function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function maxInstallmentsFor(total: number) {
  return Math.max(1, Math.min(MAX_INSTALLMENTS, Math.floor(total / MIN_INSTALLMENT_VALUE)))
}

export function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function onlyDigits(v: string) {
  return (v || '').replace(/\D/g, '')
}

export function isValidCPF(raw: string) {
  const cpf = onlyDigits(raw)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 ? 0 : r
  }
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10])
}
