const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const spacing = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).getPropertyValue('--spacing');
  });
  console.log('SPACING VAR:', spacing);
  await browser.close();
})();
