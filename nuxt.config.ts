// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@primevue/nuxt-module'],

  css: ['primeicons/primeicons.css', '~/assets/css/main.css'],

  primevue: {
    importTheme: { from: '~/theme/gabriela.ts' },
    options: { ripple: true, locale: undefined }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Sempre Gabriela | Moda feminina',
      meta: [
        { name: 'description', content: 'Sempre Gabriela — moda para todas as suas versões. Vestidos, conjuntos, blusas e mais, com entrega pelos Correios para todo o Brasil.' },
        { name: 'theme-color', content: '#D9301F' },
        { property: 'og:title', content: 'Sempre Gabriela | Moda feminina' },
        { property: 'og:image', content: '/logo-instagram.jpg' }
      ],
      link: [
        { rel: 'icon', type: 'image/jpeg', href: '/logo-instagram.jpg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,700&display=swap' }
      ]
    }
  },

  runtimeConfig: {
    // ===== Correios (API REST oficial — contrato) =====
    correios: {
      usuario: '',        // NUXT_CORREIOS_USUARIO  (usuário do Meu Correios / idCorreios)
      codigoAcesso: '',   // NUXT_CORREIOS_CODIGO_ACESSO (código de acesso às APIs)
      cartaoPostagem: '', // NUXT_CORREIOS_CARTAO_POSTAGEM
      contrato: '',       // NUXT_CORREIOS_CONTRATO
      dr: '',             // NUXT_CORREIOS_DR
      cepOrigem: '01001000', // NUXT_CORREIOS_CEP_ORIGEM
      produtoPac: '03298',   // NUXT_CORREIOS_PRODUTO_PAC
      produtoSedex: '03220'  // NUXT_CORREIOS_PRODUTO_SEDEX
    },
    // ===== Mercado Pago (cartão, Pix, boleto) =====
    mercadoPago: {
      accessToken: '',   // NUXT_MERCADO_PAGO_ACCESS_TOKEN
      webhookSecret: ''  // NUXT_MERCADO_PAGO_WEBHOOK_SECRET
    },
    public: {
      siteUrl: 'http://localhost:3000',     // NUXT_PUBLIC_SITE_URL
      mercadoPagoPublicKey: '',             // NUXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
      whatsapp: '5511999999999',            // NUXT_PUBLIC_WHATSAPP
      instagram: 'use.sempregabriela'
    }
  },

  nitro: {
    storage: {
      orders: { driver: 'fs', base: './.data/orders' }
    }
  }
})
