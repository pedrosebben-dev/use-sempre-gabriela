import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/** Paleta tirada da logo do Instagram: degradê vermelho → laranja com "g." creme. */
const GabrielaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff4ef',
      100: '#ffe4d8',
      200: '#ffc5ae',
      300: '#fd9e7c',
      400: '#f76c47',
      500: '#e5452a',
      600: '#d9301f',
      700: '#b3241a',
      800: '#8e201a',
      900: '#741e19',
      950: '#3f0b09'
    },
    focusRing: { width: '2px', style: 'solid', color: '{primary.400}', offset: '2px' },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.600}',
          contrastColor: '#fff8f1',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}'
        },
        surface: {
          0: '#ffffff',
          50: '#fdf7f1',
          100: '#f8ede3',
          200: '#efdccd',
          300: '#e2c6b2',
          400: '#c9a48c',
          500: '#a7806a',
          600: '#82604f',
          700: '#5f4439',
          800: '#3e2b24',
          900: '#2a1a15',
          950: '#170d0a'
        }
      }
    }
  },
  components: {
    button: { root: { borderRadius: '999px' } }
  }
})

export default {
  preset: GabrielaPreset,
  options: { darkModeSelector: '.sg-dark', cssLayer: false }
}
