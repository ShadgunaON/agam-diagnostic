const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1700, height: 1000 },
    headless: 'new'
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = await page.evaluate(() => {
    const rulesFound = [];
    const targetSelectors = [
      '.p-4',
      '.lg\\\\:p-10',
      '.mx-auto',
      '.lg\\\\:gap-8',
      '.lg\\\\:flex-row',
      '.lg\\\\:w-auto',
      '.max-w-\\\\[1440px\\\\]'
    ];

    for (let i = 0; i < document.styleSheets.length; i++) {
      let sheet = document.styleSheets[i];
      let href = sheet.href || 'inline';
      
      try {
        if (sheet.cssRules) {
          for (let j = 0; j < sheet.cssRules.length; j++) {
            let rule = sheet.cssRules[j];
            let cssText = rule.cssText || '';
            
            for (let sel of targetSelectors) {
              if (cssText.includes(sel.replace(/\\\\/g, '\\'))) {
                rulesFound.push({
                  stylesheet: href,
                  cssText: cssText
                });
              }
            }
          }
        }
      } catch (e) { }
    }

    const container = document.querySelector('.admin-page-container');
    let paddingTrace = null;
    let marginTrace = null;
    if (container) {
       const style = window.getComputedStyle(container);
       paddingTrace = { paddingLeft: style.paddingLeft, paddingRight: style.paddingRight };
       marginTrace = { marginLeft: style.marginLeft, marginRight: style.marginRight };
    }

    const wrapper = document.querySelector('.admin-page-container')?.parentElement?.parentElement;
    let wrapperTrace = null;
    if (wrapper) {
       const style = window.getComputedStyle(wrapper);
       wrapperTrace = { marginLeft: style.marginLeft, marginRight: style.marginRight, className: wrapper.className };
    }

    return { rules: rulesFound, containerPadding: paddingTrace, containerMargin: marginTrace, wrapperTrace: wrapperTrace };
  });

  fs.writeFileSync('dom_rules.json', JSON.stringify(result, null, 2));
  await browser.close();
})();
