import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const contentDir = path.resolve(__dirname, '..', 'src', 'content', 'projects')
const outputPath = path.resolve(__dirname, '..', 'src', 'content', 'projects-index.gen.json')

const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.md'))

const items = files.map((filename) => {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(contentDir, filename), 'utf-8')
  const { data } = matter(raw)
  const item = {
    slug,
    date: data.date,
    title: data.title,
    content: data.content,
    imageUrl: data.imageUrl,
  }
  if (data.order !== undefined) {
    item.order = data.order
  }
  if (data.share) {
    item.share = data.share
  }
  return item
})

items.sort((a, b) => {
  const orderA = typeof a.order === 'number' ? a.order : Infinity
  const orderB = typeof b.order === 'number' ? b.order : Infinity
  if (orderA !== orderB) return orderA - orderB
  return new Date(b.date).getTime() - new Date(a.date).getTime()
})

fs.writeFileSync(outputPath, JSON.stringify(items, null, 2))
