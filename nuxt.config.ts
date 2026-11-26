import { STORE } from './shared/utils/store'

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
        { name: 'description', content: 'Sempre Gabriela — moda para todas as suas versões. Vestidos longos lisos e estampados, com entrega pelos Correios para todo o Brasil.' },
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
    // ===== Melhor Envio (PAC e SEDEX sem contrato com os Correios) =====
    melhorEnvio: {
      token: '',                              // NUXT_MELHOR_ENVIO_TOKEN
      apiUrl: 'https://melhorenvio.com.br',   // NUXT_MELHOR_ENVIO_API_URL (sandbox: https://sandbox.melhorenvio.com.br)
      userAgent: 'Loja Virtual',              // NUXT_MELHOR_ENVIO_USER_AGENT: nome do app + e-mail técnico
      cepOrigem: STORE.address.cep            // NUXT_MELHOR_ENVIO_CEP_ORIGEM
    },
    // ===== Mercado Pago (cartão, Pix, boleto) =====
    mercadoPago: {
      accessToken: '',   // NUXT_MERCADO_PAGO_ACCESS_TOKEN
      webhookSecret: ''  // NUXT_MERCADO_PAGO_WEBHOOK_SECRET
    },
    public: {
      siteUrl: 'http://localhost:3000',     // NUXT_PUBLIC_SITE_URL
      mercadoPagoPublicKey: '',             // NUXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
      whatsapp: STORE.whatsapp,             // NUXT_PUBLIC_WHATSAPP
      instagram: 'use.sempregabriela'
    }
  },

  nitro: {
    storage: {
      orders: { driver: 'fs', base: './.data/orders' }
    }
  }
})
