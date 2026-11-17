export default defineEventHandler((event) => {
  const q = getQuery(event)
  let list = products
  if (q.category) list = list.filter(p => p.category === q.category)
  if (q.tag) list = list.filter(p => p.tags.includes(String(q.tag)))
  if (q.featured) list = list.filter(p => p.isBestSeller || p.isNew)
  if (q.search) {
    const s = String(q.search).toLowerCase()
    list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s))
  }
  return list
})
