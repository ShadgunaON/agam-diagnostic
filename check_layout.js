const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1700, height: 1000 });
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const result = await page.evaluate(() => {
    const container = document.querySelector('.admin-page-container');
    const wrapper = container.parentElement.parentElement;
    const parent = wrapper.parentElement;
    const getRect = (el) => {
       if (!el) return null;
       const r = el.getBoundingClientRect();
       const style = window.getComputedStyle(el);
       return {
         className: el.className,
         w: r.width, h: r.height, x: r.x, y: r.y,
         pl: style.paddingLeft, pr: style.paddingRight,
         ml: style.marginLeft, mr: style.marginRight,
         display: style.display,
         flex: style.flex,
         maxWidth: style.maxWidth
       }
    };
    return {
      parent: getRect(parent),
      wrapper: getRect(wrapper),
      container: getRect(container)
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
