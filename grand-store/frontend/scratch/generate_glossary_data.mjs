import { writeFile } from 'node:fs/promises'

const response = await fetch('https://grandstore.co.za/glossary')
if (!response.ok) throw new Error(`Glossary request failed: ${response.status}`)

const html = await response.text()
const entryPattern = /<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/gi

const windows1252Bytes = new Map([
  ['€', 0x80], ['‚', 0x82], ['ƒ', 0x83], ['„', 0x84], ['…', 0x85], ['†', 0x86], ['‡', 0x87],
  ['ˆ', 0x88], ['‰', 0x89], ['Š', 0x8a], ['‹', 0x8b], ['Œ', 0x8c], ['Ž', 0x8e],
  ['‘', 0x91], ['’', 0x92], ['“', 0x93], ['”', 0x94], ['•', 0x95], ['–', 0x96], ['—', 0x97],
  ['˜', 0x98], ['™', 0x99], ['š', 0x9a], ['›', 0x9b], ['œ', 0x9c], ['ž', 0x9e], ['Ÿ', 0x9f],
])

const repairMojibake = (input) => {
  let value = input
  for (let pass = 0; pass < 2 && /Ã|â€|Â/.test(value); pass += 1) {
    const bytes = Uint8Array.from([...value], (character) => windows1252Bytes.get(character) ?? character.codePointAt(0))
    value = new TextDecoder('utf-8').decode(bytes)
  }
  return value
}

const decode = (value) => {
  const stripped = value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim()

  return repairMojibake(stripped)
}

const entries = [...html.matchAll(entryPattern)].map((match) => ({
  term: decode(match[1]),
  definition: decode(match[2]),
}))

if (entries.length < 300) throw new Error(`Expected at least 300 glossary entries, received ${entries.length}`)

const output = `// Content mirrored from grandstore.co.za/glossary\nconst glossaryEntries = ${JSON.stringify(entries, null, 2)}\n\nexport default glossaryEntries\n`
await writeFile(new URL('../src/pages/glossaryData.js', import.meta.url), output, 'utf8')
console.log(`Wrote ${entries.length} glossary entries.`)
