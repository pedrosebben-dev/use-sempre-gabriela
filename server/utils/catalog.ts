import type { Product, ProductVariant } from '#shared/types'

/**
 * CATÁLOGO DE EXEMPLO
 * Nomes e preços são provisórios. Quando a Gabriela mandar as fotos, coloque os arquivos em
 * /public/produtos/<slug>/1.jpg, 2.jpg ... e preencha o array `images` de cada peça.
 * (Para escalar, troque este arquivo por um banco de dados / CMS — a API já isola o acesso.)
 */
const sizes = ['PP', 'P', 'M', 'G', 'GG'] as const

function variants(prefix: string, colors: [string, string][], stock = 5): ProductVariant[] {
  return colors.flatMap(([color, colorHex]) =>
    sizes.map((size, i) => ({
      sku: `${prefix}-${color.slice(0, 3).toUpperCase()}-${size}`,
      color,
      colorHex,
      size,
      // estoque de exemplo: tamanhos extremos com menos peças
      stock: i === 0 || i === 4 ? Math.max(1, stock - 3) : stock
    }))
  )
}

const box = { length: 30, width: 22, height: 6 }

export const products: Product[] = [
  {
    id: 'p01', slug: 'vestido-midi-aurora', name: 'Vestido Midi Aurora', category: 'vestidos',
    description: 'Vestido midi fluido com decote V e amarração na cintura. Leve, elegante e perfeito do brunch ao jantar.',
    details: ['Tecido: viscose 100%', 'Forro na parte superior', 'Comprimento: 115 cm (tam. M)', 'Lavar à mão'],
    price: 229.9, compareAtPrice: 279.9, images: [], weight: 350, dimensions: box,
    tags: ['festa', 'verão'], isNew: true, isBestSeller: true,
    variants: variants('VMA', [['Terracota', '#C4532F'], ['Off-white', '#F3EBDD']])
  },
  {
    id: 'p02', slug: 'conjunto-alfaiataria-lis', name: 'Conjunto Alfaiataria Lis', category: 'conjuntos',
    description: 'Blazer cropped + calça pantalona de cintura alta. Um conjunto que vai do escritório ao happy hour.',
    details: ['Tecido: alfaiataria com elastano', 'Blazer com botão frontal', 'Calça com bolsos laterais'],
    price: 349.9, images: [], weight: 700, dimensions: { length: 32, width: 25, height: 8 },
    tags: ['trabalho'], isBestSeller: true,
    variants: variants('CAL', [['Areia', '#D8C3A5'], ['Preto', '#1F1A17']])
  },
  {
    id: 'p03', slug: 'blusa-ombro-a-ombro-flor', name: 'Blusa Ombro a Ombro Flor', category: 'blusas',
    description: 'Blusa ciganinha com elástico e mangas bufantes. Romântica e confortável.',
    details: ['Tecido: tricoline', 'Elástico no decote e punhos', 'Comprimento: 55 cm'],
    price: 119.9, images: [], weight: 180, dimensions: box,
    tags: ['casual'], isNew: true,
    variants: variants('BOF', [['Branco', '#FAFAF7'], ['Rosa', '#E9A3A0']])
  },
  {
    id: 'p04', slug: 'saia-midi-plissada-sol', name: 'Saia Midi Plissada Sol', category: 'saias',
    description: 'Saia plissada com brilho acetinado e cós de elástico. Movimento lindo a cada passo.',
    details: ['Tecido: cetim plissado', 'Cós com elástico', 'Comprimento: 80 cm'],
    price: 159.9, compareAtPrice: 189.9, images: [], weight: 300, dimensions: box,
    tags: ['festa'],
    variants: variants('SMP', [['Caramelo', '#B5743C'], ['Verde-oliva', '#6B6B3A']])
  },
  {
    id: 'p05', slug: 'calca-wide-leg-clara', name: 'Calça Wide Leg Clara', category: 'calcas',
    description: 'Calça pantalona em linho misto, cintura alta com pregas. Alonga a silhueta.',
    details: ['Tecido: linho com viscose', 'Zíper lateral invisível', 'Bolsos faca'],
    price: 189.9, images: [], weight: 420, dimensions: box,
    tags: ['trabalho', 'casual'], isBestSeller: true,
    variants: variants('CWL', [['Cru', '#EDE3D1'], ['Marrom', '#5B3A29']])
  },
  {
    id: 'p06', slug: 'macacao-longo-marina', name: 'Macacão Longo Marina', category: 'macacoes',
    description: 'Macacão de alcinha com faixa na cintura e pernas amplas. Peça única, look pronto.',
    details: ['Tecido: crepe', 'Alças reguláveis', 'Faixa removível'],
    price: 259.9, images: [], weight: 450, dimensions: box,
    tags: ['festa', 'verão'], isNew: true,
    variants: variants('MLM', [['Azul-marinho', '#1F2D4D'], ['Vermelho', '#B3241A']])
  },
  {
    id: 'p07', slug: 'vestido-curto-luna', name: 'Vestido Curto Luna', category: 'vestidos',
    description: 'Vestido curto com saia evasê e alças finas. Para os dias de sol e as noites quentes.',
    details: ['Tecido: linho misto', 'Bojo removível', 'Comprimento: 85 cm'],
    price: 169.9, images: [], weight: 250, dimensions: box,
    tags: ['verão', 'casual'],
    variants: variants('VCL', [['Amarelo', '#E8B931'], ['Estampado', '#C96B4B']])
  },
  {
    id: 'p08', slug: 'cropped-tricot-mel', name: 'Cropped Tricot Mel', category: 'blusas',
    description: 'Cropped de tricot canelado com gola alta. Combina com tudo do seu guarda-roupa.',
    details: ['Tecido: tricot canelado', 'Ajuste ao corpo', 'Comprimento: 42 cm'],
    price: 99.9, images: [], weight: 200, dimensions: box,
    tags: ['casual', 'inverno'],
    variants: variants('CTM', [['Mel', '#D19A4A'], ['Off-white', '#F3EBDD'], ['Preto', '#1F1A17']])
  },
  {
    id: 'p09', slug: 'conjunto-linho-praia', name: 'Conjunto Linho Praia', category: 'conjuntos',
    description: 'Camisa amarrada + short de cintura alta em linho. O conjunto das férias.',
    details: ['Tecido: linho com viscose', 'Short com elástico nas costas', 'Camisa com botões de coco'],
    price: 239.9, compareAtPrice: 289.9, images: [], weight: 380, dimensions: box,
    tags: ['verão'],
    variants: variants('CLP', [['Branco', '#FAFAF7'], ['Terracota', '#C4532F']])
  },
  {
    id: 'p10', slug: 'vestido-longo-gabi', name: 'Vestido Longo Gabi', category: 'vestidos',
    description: 'O vestido assinatura da marca: longo, com fenda lateral e costas abertas.',
    details: ['Tecido: malha canelada premium', 'Fenda lateral', 'Comprimento: 140 cm'],
    price: 299.9, images: [], weight: 400, dimensions: box,
    tags: ['festa'], isBestSeller: true, isNew: true,
    variants: variants('VLG', [['Vermelho', '#B3241A'], ['Preto', '#1F1A17']])
  },
  {
    id: 'p11', slug: 'saia-jeans-midi-rio', name: 'Saia Jeans Midi Rio', category: 'saias',
    description: 'Saia jeans midi com fenda frontal e lavagem clara. Básica que nunca sai de moda.',
    details: ['Tecido: jeans com elastano', 'Fenda frontal', '5 bolsos'],
    price: 149.9, images: [], weight: 480, dimensions: box,
    tags: ['casual'],
    variants: variants('SJR', [['Jeans claro', '#9DB4CF']])
  },
  {
    id: 'p12', slug: 'body-decote-quadrado-bela', name: 'Body Decote Quadrado Bela', category: 'blusas',
    description: 'Body de suplex com decote quadrado e fechamento por colchetes. Ajuste perfeito.',
    details: ['Tecido: suplex', 'Fechamento por colchetes', 'Forro duplo'],
    price: 89.9, images: [], weight: 150, dimensions: box,
    tags: ['casual', 'festa'],
    variants: variants('BDQ', [['Preto', '#1F1A17'], ['Chocolate', '#4A2C21'], ['Vermelho', '#B3241A']])
  }
]

export function findProduct(idOrSlug: string) {
  return products.find(p => p.id === idOrSlug || p.slug === idOrSlug)
}
