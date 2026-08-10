const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: { width: 1700, height: 1000 },
    headless: 'new'
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = await page.evaluate(() => {
    const getRectAndStyles = (el) => {
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        className: el.className,
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right },
        styles: {
          width: style.width,
          maxWidth: style.maxWidth,
          paddingLeft: style.paddingLeft,
          paddingRight: style.paddingRight,
          marginLeft: style.marginLeft,
          marginRight: style.marginRight,
          overflowX: style.overflowX,
          transform: style.transform,
          transformOrigin: style.transformOrigin,
          display: style.display,
          flexDirection: style.flexDirection,
          gap: style.gap,
          justifyContent: style.justifyContent,
          alignItems: style.alignItems,
          position: style.position
        }
      };
    };

    const findByText = (text) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.includes(text)) {
          return node.parentElement;
        }
      }
      return null;
    };

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      html: getRectAndStyles(document.documentElement),
      body: getRectAndStyles(document.body),
      adminDesktopScale: getRectAndStyles(document.querySelector('.admin-desktop-scale')),
      adminPageContainer: getRectAndStyles(document.querySelector('.admin-page-container')),
      orderManagementParent: getRectAndStyles(findByText('Order Management')?.parentElement?.parentElement), 
      createBookingBtn: getRectAndStyles(findByText('Create Booking')?.closest('button')),
      filterBar: getRectAndStyles(document.querySelector('.admin-page-container > div:nth-child(2)')),
      tableHeader: getRectAndStyles(document.querySelector('.admin-hide-table-header')),
      templateWrapper: getRectAndStyles(document.querySelector('.admin-page-container')?.parentElement?.parentElement)
    };
  });

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})();
