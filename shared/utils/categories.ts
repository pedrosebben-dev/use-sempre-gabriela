import type { Category } from '../types'

/** Estilos da coleção: menu, rodapé, filtros e home saem todos daqui. */
export const CATEGORIES: { value: Category, label: string }[] = [
  { value: 'florais', label: 'Florais' },
  { value: 'conchas', label: 'Conchas' },
  { value: 'mediterraneo', label: 'Mediterrâneo' },
  { value: 'lisos', label: 'Lisos' }
]

export function categoryLabel(value: string) {
  return CATEGORIES.find(c => c.value === value)?.label ?? value
}
