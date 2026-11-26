/**
 * Dados da loja enviados pela cliente no checklist de 19/11/2026.
 * São públicos: o Decreto 7.962/2013 exige nome, CNPJ, endereço físico e eletrônico no site.
 * Não coloque aqui chave Pix, token ou qualquer credencial (a chave Pix fica na conta do Mercado Pago).
 */
export const STORE = {
  name: 'Sempre Gabriela',
  legalName: '59.376.753 GABRIELA PINTO MARQUES',
  cnpj: '59.376.753/0001-49',
  email: 'sempregabrielaadm@gmail.com',
  // Como veio no checklist. Canela usa DDD 54: confirmar se é mesmo 55.
  phone: '(55) 98122-0095',
  whatsapp: '5555981220095',
  address: {
    street: 'Rua João Pessoa',
    number: '125',
    // O bairro não veio no checklist e é obrigatório para emitir etiqueta no Melhor Envio.
    neighborhood: '',
    city: 'Canela',
    state: 'RS',
    cep: '95680-276'
  }
}

export function storeAddressLine() {
  const { street, number, neighborhood, city, state, cep } = STORE.address
  return [`${street}, ${number}`, neighborhood, `${city}/${state}`, `CEP ${cep}`].filter(Boolean).join(' · ')
}
