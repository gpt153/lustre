import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await ctx.newPage();

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()) });
page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
page.on('response', res => { if (res.status() >= 400) errors.push(`HTTP ${res.status()} ${res.url()}`) });

console.log('--- Step 1: Load /auth ---');
await page.goto('https://app.lovelustre.com/auth', { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: '/tmp/screenshots/01-auth.png' });
console.log('URL:', page.url());
console.log('Title:', await page.title());

const devBtn = page.locator('button', { hasText: 'Dev login' });
const devBtnCount = await devBtn.count();
console.log('Dev login button found:', devBtnCount > 0);
if (devBtnCount === 0) {
  console.log('Page HTML:', await page.content());
  await browser.close(); process.exit(1);
}

console.log('--- Step 2: Click dev login ---');
// Listen for network requests
const [response] = await Promise.all([
  page.waitForResponse(r => r.url().includes('dev-login'), { timeout: 10000 }).catch(() => null),
  devBtn.click(),
]);
if (response) console.log('dev-login response:', response.status(), await response.text().catch(() => '(unreadable)'));

await page.waitForTimeout(3000);
await page.screenshot({ path: '/tmp/screenshots/02-after-login.png' });
console.log('URL after login:', page.url());

if (errors.length) console.log('ERRORS:', errors);

if (page.url().includes('/home')) {
  console.log('✅ SUCCESS - on /home');
  const content = await page.textContent('body');
  console.log('Page has content:', content?.slice(0, 200));
} else {
  console.log('❌ FAILED - still on', page.url());
  console.log('Body:', (await page.textContent('body'))?.slice(0, 500));
}

await browser.close();
