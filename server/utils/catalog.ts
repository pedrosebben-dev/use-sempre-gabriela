import type { Product, ProductVariant } from '#shared/types'

/**
 * CATÁLOGO DA COLEÇÃO (fotos reais, enviadas pela cliente em 20/11/2026)
 *
 * Vêm das fotos: peça, cor, estampa e os detalhes visíveis.
 * SÃO EXEMPLOS até a loja confirmar: nome, preço, tamanhos e estoque.
 * Quando confirmar uma peça, ajuste os valores e troque para `confirmed: true`.
 * Em produção, peça com `confirmed: false` não pode ser vendida (server/utils/launch.ts).
 */
type Size = ProductVariant['size']

// Checklist: caixa de 30×22×6 cm e peças de 50 g a 700 g já embaladas.
// Usa o teto da faixa até a loja mandar o peso de cada peça, para o frete não sair abaixo do custo.
const BOX = { length: 30, width: 22, height: 6 }
const WEIGHT = 700
const EXAMPLE_STOCK: Partial<Record<Size, number>> = { P: 5, M: 5, G: 5 }

/** public/produtos/<slug>/<n>.jpg (1200 px de largura) e <n>-p.jpg (600 px) */
function photos(slug: string, count: number) {
  return Array.from({ length: count }, (_, i) => `/produtos/${slug}/${i + 1}.jpg`)
}

function variants(prefix: string, color: string, colorHex: string, stock: Partial<Record<Size, number>>): ProductVariant[] {
  return (Object.entries(stock) as [Size, number][]).map(([size, qty]) => ({
    sku: `${prefix}-${size}`, color, colorHex, size, stock: qty
  }))
}

export const products: Product[] = [
  {
    id: 'sg01', slug: 'vestido-longo-rubi', name: 'Vestido Longo Rubi', category: 'lisos',
    price: 299.9, confirmed: false,
    description: 'Vestido longo vermelho de brilho acetinado, frente única, com decote degagê e costas abertas.',
    details: ['Frente única', 'Decote degagê', 'Costas abertas', 'Três botões na gola'],
    images: photos('vestido-longo-rubi', 5), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('RUB', 'Vermelho', '#C8242B', EXAMPLE_STOCK)
  },
  {
    id: 'sg02', slug: 'vestido-longo-tulipa', name: 'Vestido Longo Tulipa', category: 'florais',
    price: 269.9, confirmed: false,
    description: 'Vestido longo off-white com grandes tulipas vermelhas, busto em camadas e saia franzida.',
    details: ['Alças finas reguláveis', 'Busto com pregas horizontais', 'Saia franzida'],
    images: photos('vestido-longo-tulipa', 4), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('TUL', 'Off-white', '#F3EBDD', EXAMPLE_STOCK)
  },
  {
    id: 'sg03', slug: 'vestido-longo-riviera', name: 'Vestido Longo Riviera', category: 'mediterraneo',
    price: 259.9, confirmed: false,
    description: 'Vestido longo azul com paisagem de praia mediterrânea na barra e saia franzida.',
    details: ['Alças de amarrar nos ombros', 'Decote reto', 'Recorte abaixo do busto'],
    images: photos('vestido-longo-riviera', 3), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('RIV', 'Azul', '#8DB8DF', EXAMPLE_STOCK)
  },
  {
    id: 'sg04', slug: 'vestido-kaftan-mare', name: 'Vestido Kaftan Maré', category: 'conchas',
    price: 239.9, confirmed: false,
    description: 'Vestido kaftan longo preto com conchas e estrelas-do-mar em traço claro.',
    details: ['Mangas amplas', 'Decote V', 'Cintura franzida com amarração'],
    images: photos('vestido-kaftan-mare', 2), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('MAR', 'Preto', '#17181D', EXAMPLE_STOCK)
  },
  {
    id: 'sg05', slug: 'vestido-longo-lirio-noite', name: 'Vestido Longo Lírio Noite', category: 'florais',
    price: 249.9, confirmed: false,
    description: 'Vestido longo preto com lírios amarelos e lilases na saia.',
    details: ['Alças largas', 'Decote reto', 'Cintura marcada', 'Saia franzida'],
    images: photos('vestido-longo-lirio-noite', 2), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('LNO', 'Preto', '#17181D', EXAMPLE_STOCK)
  },
  {
    id: 'sg06', slug: 'vestido-longo-brisa', name: 'Vestido Longo Brisa', category: 'conchas',
    price: 259.9, confirmed: false,
    description: 'Vestido longo off-white com conchas em traço preto e amarração nas costas.',
    details: ['Alças reguláveis', 'Decote arredondado', 'Recorte com laço nas costas'],
    images: photos('vestido-longo-brisa', 3), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('BRI', 'Off-white', '#F3EBDD', EXAMPLE_STOCK)
  },
  {
    id: 'sg07', slug: 'vestido-kaftan-sicilia', name: 'Vestido Kaftan Sicília', category: 'mediterraneo',
    price: 239.9, confirmed: false,
    description: 'Vestido kaftan longo off-white com estampa mediterrânea de frutas, flores e mar.',
    details: ['Mangas amplas', 'Decote V', 'Cintura franzida com amarração'],
    images: photos('vestido-kaftan-sicilia', 1), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('SIC', 'Off-white', '#F3EBDD', EXAMPLE_STOCK)
  },
  {
    id: 'sg08', slug: 'vestido-longo-lirio-aquarela', name: 'Vestido Longo Lírio Aquarela', category: 'florais',
    price: 279.9, confirmed: false,
    description: 'Vestido longo off-white com lírios coloridos na barra e recortes que marcam a cintura.',
    details: ['Alças finas', 'Decote V profundo', 'Recortes com franzido na lateral'],
    images: photos('vestido-longo-lirio-aquarela', 1), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('LAQ', 'Off-white', '#F3EBDD', EXAMPLE_STOCK)
  },
  {
    id: 'sg09', slug: 'vestido-longo-perola', name: 'Vestido Longo Pérola', category: 'conchas',
    price: 249.9, confirmed: false,
    description: 'Vestido longo off-white com decote reto e conchas em traço preto.',
    details: ['Alças finas', 'Decote reto', 'Recorte abaixo do busto'],
    images: photos('vestido-longo-perola', 1), weight: WEIGHT, dimensions: BOX, tags: [],
    variants: variants('PER', 'Off-white', '#F3EBDD', EXAMPLE_STOCK)
  }
]

export function findProduct(idOrSlug: string) {
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug)
}
