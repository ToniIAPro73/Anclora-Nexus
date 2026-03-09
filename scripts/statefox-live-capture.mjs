import fs from 'node:fs/promises'
import path from 'node:path'
import readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

if (process.argv.includes('--help')) {
  console.log(`StateFox live capture

Usage:
  npm run ops:statefox:capture

Behavior:
  - opens Telegram Web in a visible Playwright browser
  - reuses a persistent local profile in ops/statefox-playwright-profile
  - waits for the operator to show StateFox results
  - saves ops/statefox-live-capture.json
`)
  process.exit(0)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const profileDir = path.join(repoRoot, 'ops', 'statefox-playwright-profile')
const outputPath = path.join(repoRoot, 'ops', 'statefox-live-capture.json')
const targetUrl = process.env.STATEFOX_CHAT_URL || 'https://web.telegram.org/k/#@StateFoxBot'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function uniq(values) {
  return [...new Set(values.filter(Boolean))]
}

async function main() {
  if (!process.stdin.isTTY) {
    throw new Error('Interactive terminal required. Run this command locally from a TTY session.')
  }

  await fs.mkdir(profileDir, { recursive: true })
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    slowMo: 50,
    viewport: { width: 1440, height: 960 },
  })
  const page = context.pages()[0] || (await context.newPage())

  console.log(`[statefox-live-capture] opening ${targetUrl}`)
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' })

  console.log('[statefox-live-capture] If Telegram asks for login, complete it in the visible browser.')
  console.log('[statefox-live-capture] Then open the StateFox chat, run the search you want, and bring the results into view.')
  await rl.question('[statefox-live-capture] Press ENTER when the results are visible and ready to capture...')

  const snapshot = await page.evaluate(() => {
    const bodyText = document.body.innerText || ''
    const hrefs = Array.from(document.querySelectorAll('a[href]'))
      .map((anchor) => anchor.getAttribute('href') || '')
      .filter(Boolean)
    const statefoxLinks = hrefs.filter((href) => href.includes('StateFoxBot?startapp='))
    const publicPropertyLinks = hrefs.filter((href) => href.includes('es.statefox.com/public/ln/property/'))

    return {
      title: document.title,
      url: window.location.href,
      raw_text: bodyText,
      hrefs,
      statefox_links: statefoxLinks,
      public_property_links: publicPropertyLinks,
    }
  })

  const payload = {
    feature_id: 'ANCLORA-STFX-003.v1',
    captured_at: new Date().toISOString(),
    target_url: targetUrl,
    page_title: snapshot.title,
    page_url: snapshot.url,
    statefox_links: uniq(snapshot.statefox_links),
    public_property_links: uniq(snapshot.public_property_links),
    hrefs: uniq(snapshot.hrefs),
    raw_text: snapshot.raw_text,
  }

  await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8')
  console.log(`[statefox-live-capture] saved ${outputPath}`)
  console.log(`[statefox-live-capture] statefox_links=${payload.statefox_links.length} public_property_links=${payload.public_property_links.length}`)

  await rl.question('[statefox-live-capture] Press ENTER to close the browser...')
  await context.close()
  await rl.close()
}

main().catch(async (error) => {
  console.error('[statefox-live-capture] failed:', error)
  await rl.close()
  process.exit(1)
})
