import fs from 'node:fs'
import path from 'node:path'
import { PDFParse } from 'pdf-parse'

const root = path.resolve(import.meta.dirname, '..')
const files = [
  '8th Governing Body Agenda Points.docx.pdf',
  'MIET STRATEGIC PLAN (2024-30) (1).pdf',
]

for (const name of files) {
  const filePath = path.join(root, name)
  const data = fs.readFileSync(filePath)
  const parser = new PDFParse({ data })
  const textResult = await parser.getText()
  const info = await parser.getInfo()
  await parser.destroy()

  const outName = name.replace(/\.pdf$/i, '.txt')
  const outPath = path.join(root, 'docs', outName)
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, textResult.text, 'utf8')

  console.log(`\n===== ${name} =====`)
  console.log(`Pages: ${info.total}`)
  console.log(textResult.text.slice(0, 8000))
  console.log(`\n[Saved full text to docs/${outName}]`)
}
