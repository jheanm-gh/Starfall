import { chromium } from 'playwright';
const OUT = process.argv[2];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewportSize: { width: 900, height: 820 } });
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error' && !m.text().includes('404')) errs.push(m.text()); });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

await page.getByRole('button', { name: 'Styleguide' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: OUT + '/sg.png', fullPage: true });

await page.getByRole('button', { name: 'Roster' }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /Showing recovered/ }).click();
await page.waitForTimeout(400);
await page.locator('main button:has(img)').nth(40).click();
await page.waitForTimeout(400);
await page.screenshot({ path: OUT + '/roster.png', fullPage: true });

await page.getByRole('button', { name: 'Requisition' }).click();
await page.waitForTimeout(300);
await page.getByRole('button', { name: /Full summon/ }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: OUT + '/gacha.png', fullPage: true });

await page.getByRole('button', { name: 'Bridge' }).click();
await page.waitForTimeout(300);
const cards = page.locator('main button:has(img)');
for (let i = 0; i < 3; i++) await cards.nth(i).click();
await page.getByRole('button', { name: 'Launch' }).click();
await page.waitForTimeout(400);

let floors = 0, presses = 0;
for (let step = 0; step < 120; step++) {
  const adv = page.getByRole('button', { name: 'Advance' });
  const cont = page.getByRole('button', { name: 'Continue' });
  const up = page.getByRole('button', { name: 'Move up' });
  const leave = page.getByRole('button', { name: 'Leave the hub' });
  if (await adv.count()) { await adv.click(); floors++; }
  else if (await cont.count()) await cont.click();
  else if (await up.count()) await up.click();
  else if (await leave.count()) await leave.click();
  else if (await page.locator('main button:has-text("cd")').count()
        || await page.locator('main button:has-text("no cooldown")').count()) {
    await page.keyboard.press('1'); presses++;
  } else {
    const ev = page.locator('main button b').first();
    if (await ev.count()) await ev.click(); else break;
  }
  await page.waitForTimeout(80);
}
await page.screenshot({ path: OUT + '/run.png', fullPage: true });
const heading = await page.locator('main h2, main h3').first().textContent().catch(() => '');
console.log('floors ' + floors + ', skill presses ' + presses + ', now: ' + (heading || '').trim());
console.log('ERRORS: ' + (errs.length ? errs.slice(0, 5).join(' | ') : 'none'));
await browser.close();
