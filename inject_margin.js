const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1700, height: 1000 });
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const result = await page.evaluate(() => {
    const wrapper = document.querySelector('.mx-auto.w-full.max-w-\\\\[1440px\\\\]');
    if (!wrapper) return null;
    
    const before = {
      x: wrapper.getBoundingClientRect().x,
      ml: window.getComputedStyle(wrapper).marginLeft
    };
    
    // forcefully apply inline styles
    wrapper.style.marginLeft = 'auto';
    wrapper.style.marginRight = 'auto';
    
    const after = {
      x: wrapper.getBoundingClientRect().x,
      ml: window.getComputedStyle(wrapper).marginLeft
    };
    
    return { before, after };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
