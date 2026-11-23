# Sempre Gabriela — loja virtual

Loja da **@use.sempregabriela** feita com **Nuxt 4 + Vue 3 + TypeScript + Pinia + PrimeVue 4**.

- Coleção real (9 vestidos, 22 fotos) com filtros por estilo, tamanho, busca e ordenação
- Sacola lateral + página de sacola, persistida no navegador
- **Frete PAC e SEDEX pelo Melhor Envio** + busca de endereço por CEP (ViaCEP / BrasilAPI)
- **Pagamento pelo Mercado Pago**: Pix (QR Code + copia e cola), cartão de crédito (até 3x sem juros) e boleto
- Webhook do Mercado Pago, página do pedido que se atualiza sozinha
- Regras confirmadas pela loja: 5% off no Pix, 3x sem juros
- Regras **ainda não confirmadas** pela loja: frete grátis no PAC acima de R$ 399, parcela mínima de R$ 50, primeira troca grátis

> **Trava de pré-lançamento:** no `npm run dev` tudo funciona em demonstração. No build de produção a loja só
> aceita pedido com Mercado Pago e Melhor Envio configurados **e** peça com `confirmed: true` no catálogo.

## Rodando

```bash
npm install
cp .env.example .env   # preencha as chaves (opcional para testar)
npm run dev            # http://localhost:3000
```

Build de produção: `npm run build` e depois `node .output/server/index.mjs`.

> **Projeto dentro do iCloud Drive?** Marque as pastas geradas para o iCloud não sincronizá-las
> (rode depois do `npm install`, e de novo se apagar o `node_modules` ou usar `npm ci`):
>
> ```bash
> xattr -w 'com.apple.fileprovider.ignore#P' 1 node_modules .nuxt
> ```

## Configurando o frete (Melhor Envio)

A loja não tem contrato com os Correios, então o PAC e o SEDEX são cotados pelo Melhor Envio.

1. Na conta da loja: **Integrações → Permissões de acesso**, gere um token com permissão de cotação (`shipping-calculate`).
   Confira a validade na tela. Se usar OAuth (Área Dev), o token vence em 30 dias e exige rotina de renovação.
2. Preencha `NUXT_MELHOR_ENVIO_TOKEN`.
3. Preencha `NUXT_MELHOR_ENVIO_USER_AGENT` com nome do app e e-mail de contato técnico (a API exige).
4. O CEP de origem já é o da loja (Canela/RS).

O código está em `server/utils/shipping.ts`. Até a loja mandar o peso de cada peça, todas usam 700 g (teto da faixa informada).
Para emitir etiqueta ainda vão faltar o **bairro** e o documento da remetente.

## Configurando o Mercado Pago (pagamento real)

1. Crie uma aplicação em <https://www.mercadopago.com.br/developers/panel/app>.
2. Copie a **Public Key** para `NUXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` e o **Access Token** para `NUXT_MERCADO_PAGO_ACCESS_TOKEN`. Use as credenciais **de teste** primeiro.
3. Em *Webhooks*, cadastre `https://SEU-DOMINIO/api/webhooks/mercadopago` (evento **Pagamentos**) e copie a assinatura secreta para `NUXT_MERCADO_PAGO_WEBHOOK_SECRET`.
4. Defina `NUXT_PUBLIC_SITE_URL` com o domínio `https://` da loja.
5. Ative o Pix na conta do Mercado Pago (é preciso ter uma chave Pix cadastrada).
6. Ative **parcelas sem acréscimo até 3x** em *Seu negócio → Custos*. Sem isso o Mercado Pago cobra juros da cliente,
   mesmo com o site anunciando "sem juros".
7. No mesmo painel, escolha o prazo de recebimento. As opções são na hora, 14 ou 30 dias (não existe 1 dia útil).
8. A integração usa a **API de Pagamentos** (`/v1/payments`), que o Mercado Pago hoje chama de legada. Ela segue funcionando,
   mas teste com as credenciais de teste da aplicação nova antes de abrir a loja.

Os dados do cartão são tokenizados no navegador pelo MercadoPago.js e **nunca passam pelo servidor**. O servidor recalcula preço, frete, desconto e parcelas antes de cobrar, então mudar valores pelo navegador não tem efeito.

## Catálogo e fotos

As peças estão em `server/utils/catalog.ts`. Fotos, cores e detalhes visíveis são reais. **Nome, preço, tamanhos e
estoque são exemplos.** Quando a loja confirmar uma peça, ajuste os valores e troque para `confirmed: true`.

Para adicionar fotos, gere duas versões de cada uma em `public/produtos/<slug>/` e **remova os metadados**
(foto de celular pode trazer o GPS):

- `1.jpg`: 1200 px de largura
- `1-p.jpg`: 600 px de largura

**Logo:** o arquivo atual (`public/logo-instagram.jpg`) é a foto de perfil do Instagram, só 150 px. Peça o arquivo original.

Os dados da loja (CNPJ, endereço, contato) ficam em `shared/utils/store.ts`.

## Estrutura

```
app/
  pages/          index, produtos, produto/[slug], carrinho, checkout, pedido/[id], sobre, trocas
  components/     AppHeader, AppFooter, CartDrawer, ProductCard, ShippingCalculator...
  stores/         cart.ts (sacola), checkout.ts (dados, endereço, frete)
  composables/    useMercadoPago (tokenização do cartão), useStoreConfig
  theme/          gabriela.ts (preset PrimeVue com as cores da marca)
server/
  api/            products, cep, shipping/quote, orders, webhooks/mercadopago
  utils/          catalog, shipping (Melhor Envio), mercadopago, orders, cart, launch (trava)
shared/           tipos e regras de preço usadas no front e no back
```

## Antes de colocar no ar

Com a loja:
- [ ] Nome, preço, tamanhos, estoque e peso de cada peça; tabela de medidas
- [ ] Bairro do endereço e confirmação do DDD do telefone
- [ ] Confirmar frete grátis, parcela mínima e primeira troca grátis
- [ ] Tokens do Mercado Pago e do Melhor Envio, por canal seguro
- [ ] Confirmar com o contador o documento fiscal do MEI nos envios (a regra muda em 01/01/2027)
- [ ] Logo em alta resolução e texto do "Sobre"

No código:
- [ ] Banco de dados para pedidos: na Vercel o disco não persiste, e `.data/orders` não funciona
- [ ] `GET /api/orders/:id` devolve CPF e endereço a quem tiver o código do pedido: proteger e usar ID forte
- [ ] Baixar estoque ao vender
- [ ] E-mail do pedido para a loja e para a cliente
- [ ] Etiqueta e rastreio pelo Melhor Envio
