import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
const routes = ['/', '/home', '/auth', '/discover', '/chat', '/learn', '/coach', '/groups'];
for (const route of routes) {
  const base = process.env.BASE_URL ?? 'https://app.lovelustre.com';
  const res = await page.goto(base + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log(route, res.status());
}
await browser.close();
