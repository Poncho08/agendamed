import { chromium } from "@playwright/test"

function html(size) {
  const fontSize = Math.round(size * 0.42)
  return `<!doctype html><html><head><style>
    html,body{margin:0;padding:0}
    .box{width:${size}px;height:${size}px;background:#0ea5e9;display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-weight:800;color:#fff;font-size:${fontSize}px;
      letter-spacing:-${Math.round(size*0.02)}px}
  </style></head><body><div class="box">AM</div></body></html>`
}

const sizes = [192, 512]
const browser = await chromium.launch()
for (const size of sizes) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
  await page.setContent(html(size))
  await page.screenshot({ path: `public/icon-${size}.png`, clip: { x: 0, y: 0, width: size, height: size } })
  await page.close()
  console.log(`✓ public/icon-${size}.png`)
}
await browser.close()
