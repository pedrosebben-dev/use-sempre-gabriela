# Sempre Gabriela — loja virtual

Loja da **@use.sempregabriela** feita com **Nuxt 4 + Vue 3 + TypeScript + Pinia + PrimeVue 4**.

- Catálogo com filtros (categoria, tamanho, busca, ordenação), página de produto com cor/tamanho/estoque
- Sacola lateral + página de sacola, persistida no navegador
- **Frete pelos Correios** (PAC e SEDEX) com a API REST oficial + busca de endereço por CEP (ViaCEP / BrasilAPI)
- **Pagamento pelo Mercado Pago**: Pix (QR Code + copia e cola), cartão de crédito (até 6x sem juros) e boleto
- Webhook do Mercado Pago com validação de assinatura, página do pedido que se atualiza sozinha
- Regras da loja: 5% off no Pix, frete grátis no PAC acima de R$ 399, parcela mínima de R$ 50

> Sem as chaves configuradas, a loja roda em **modo demonstração**: o frete vem de uma tabela estimada e nenhum pagamento é cobrado.

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

## Configurando os Correios (frete real)

1. É preciso ter **contrato com os Correios** (pode ser o "Correios Empresas" para pequenos negócios).
2. Em <https://cws.correios.com.br>, gere o **código de acesso às APIs** e confira o número do **cartão de postagem**, do **contrato** e da **DR**.
3. Preencha no `.env`: `NUXT_CORREIOS_USUARIO`, `NUXT_CORREIOS_CODIGO_ACESSO`, `NUXT_CORREIOS_CARTAO_POSTAGEM`, `NUXT_CORREIOS_CONTRATO`, `NUXT_CORREIOS_DR` e o `NUXT_CORREIOS_CEP_ORIGEM` (de onde as peças saem).
4. Confira com seu contrato os códigos de serviço (`03298` PAC e `03220` SEDEX são os padrões de contrato).

O código está em `server/utils/correios.ts` (token com cache, preço e prazo em paralelo). O peso e as medidas de cada peça ficam no catálogo.

## Configurando o Mercado Pago (pagamento real)

1. Crie uma aplicação em <https://www.mercadopago.com.br/developers/panel/app>.
2. Copie a **Public Key** para `NUXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` e o **Access Token** para `NUXT_MERCADO_PAGO_ACCESS_TOKEN`. Use as credenciais **de teste** primeiro.
3. Em *Webhooks*, cadastre `https://SEU-DOMINIO/api/webhooks/mercadopago` (evento **Pagamentos**) e copie a assinatura secreta para `NUXT_MERCADO_PAGO_WEBHOOK_SECRET`.
4. Defina `NUXT_PUBLIC_SITE_URL` com o domínio `https://` da loja.
5. Ative o Pix na conta do Mercado Pago (é preciso ter uma chave Pix cadastrada).

Os dados do cartão são tokenizados no navegador pelo MercadoPago.js e **nunca passam pelo servidor**. O servidor recalcula preço, frete, desconto e parcelas antes de cobrar, então mudar valores pelo navegador não tem efeito.

## Trocando nomes e fotos das peças

Os produtos de exemplo estão em `server/utils/catalog.ts`. Para cada peça:

1. Coloque as fotos em `public/produtos/<slug>/1.jpg`, `2.jpg`... (de preferência 1200×1500 px, proporção 4:5)
2. Preencha `images: ['/produtos/<slug>/1.jpg', '/produtos/<slug>/2.jpg']`
3. Ajuste nome, preço, descrição, cores (`colorHex`), tamanhos, estoque e peso

Enquanto não houver foto, aparece um placeholder com o "g." da marca na cor da peça.

**Logo:** o arquivo atual (`public/logo-instagram.jpg`) é a foto de perfil do Instagram, só 150 px. Peça o arquivo original (SVG ou PNG grande) e substitua.

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
  utils/          catalog, correios, mercadopago, orders, cart
shared/           tipos e regras de preço usadas no front e no back
```

## Antes de colocar no ar

- [ ] Fotos, nomes, preços e estoque reais em `catalog.ts` (ou migrar para um banco/CMS)
- [ ] Logo em alta resolução
- [ ] Chaves de produção do Mercado Pago e dos Correios
- [ ] Trocar o armazenamento de pedidos (`.data/orders`, em arquivo) por um banco (Postgres, Redis, Supabase...) se a hospedagem não tiver disco persistente
- [ ] E-mail de confirmação do pedido (ponto marcado com `TODO` no webhook)
- [ ] CNPJ, WhatsApp e textos de "Sobre" e "Trocas"
- [ ] Painel para a Gabriela ver os pedidos e gerar etiquetas (próxima etapa)
