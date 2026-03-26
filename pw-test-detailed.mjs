import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();

// Capture console errors
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('  CONSOLE ERROR:', msg.text());
  }
});

// Capture page errors
page.on('pageerror', err => {
  console.log('  PAGE ERROR:', err.message);
});

const routes = ['/', '/home', '/auth', '/discover', '/chat', '/learn', '/coach', '/groups'];
for (const route of routes) {
  const res = await page.goto('http://localhost:3000' + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(route, res.status());
}
await browser.close();
