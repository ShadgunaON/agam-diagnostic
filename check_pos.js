const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const res = await page.evaluate(() => {
    return window.getComputedStyle(document.querySelector('.mx-auto.w-full.max-w-\\\\[1440px\\\\]')).position;
  });
  console.log('POSITION:', res);
  await browser.close();
})();
