<script setup lang="ts">
useSeoMeta({ title: 'Trocas, entregas e pagamentos | Sempre Gabriela' })
</script>

<template>
  <div class="container page narrow">
    <span class="eyebrow">Ajuda</span>
    <h1>Trocas, entregas e pagamentos</h1>

    <section class="card">
      <h2>Trocas e devoluções</h2>
      <ul>
        <li>A <strong>primeira troca é grátis</strong> em até 7 dias corridos após o recebimento.</li>
        <li>A peça deve estar sem uso, com etiqueta e na embalagem original.</li>
        <li>Pelo Código de Defesa do Consumidor, você pode desistir da compra em até 7 dias e receber o valor de volta.</li>
        <li>Para solicitar, chame a gente no WhatsApp com o número do pedido.</li>
      </ul>
    </section>

    <section id="entrega" class="card">
      <h2>Entregas</h2>
      <ul>
        <li>Enviamos para todo o Brasil pelos <strong>Correios</strong> (PAC e SEDEX).</li>
        <li>O prazo começa a contar após a confirmação do pagamento + 1 dia útil de separação.</li>
        <li><strong>Frete grátis</strong> no PAC em compras acima de {{ formatBRL(FREE_SHIPPING_FROM) }}.</li>
        <li>O código de rastreio é enviado por e-mail assim que o pedido é postado.</li>
      </ul>
    </section>

    <section id="pagamento" class="card">
      <h2>Formas de pagamento</h2>
      <ul>
        <li><strong>Pix</strong> com {{ PIX_DISCOUNT * 100 }}% de desconto — aprovação imediata.</li>
        <li><strong>Cartão de crédito</strong> em até {{ MAX_INSTALLMENTS }}x sem juros (parcela mínima de {{ formatBRL(MIN_INSTALLMENT_VALUE) }}).</li>
        <li><strong>Boleto</strong> com vencimento em 3 dias úteis.</li>
        <li>Pagamentos processados com segurança pelo Mercado Pago.</li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.narrow { max-width: 760px; display: flex; flex-direction: column; gap: 18px; }
h2 { font-family: var(--sg-sans); font-size: 1.15rem; font-weight: 700; margin-bottom: 10px; }
ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; }
section { scroll-margin-top: 100px; }
</style>
