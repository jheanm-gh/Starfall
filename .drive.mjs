import { chromium } from 'playwright';
const OUT = process.argv[2];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewportSize: { width: 900, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/01-bridge.png`, fullPage: true });

// Pick the first three heroes offered and launch.
const cards = page.locator('main button:has(img)');
const n = await cards.count();
for (let i = 0; i < Math.min(3, n); i++) await cards.nth(i).click();
await page.waitForTimeout(200);
await page.screenshot({ path: `${OUT}/02-crew.png`, fullPage: true });
await page.getByRole('button', { name: 'Launch' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/03-map.png`, fullPage: true });
await page.getByRole('button', { name: 'Advance' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/04-combat.png` });

// Play a few rounds with the keyboard, as §2.6 requires.
for (let i = 0; i < 6; i++) {
  await page.keyboard.press('1');
  await page.waitForTimeout(220);
}
await page.keyboard.press('l');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/05-combat-log.png` });
console.log('ERRORS:', errors.length ? errors.slice(0,8).join('\n') : 'none');
await browser.close();
