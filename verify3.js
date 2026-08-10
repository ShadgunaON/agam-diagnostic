const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1700, height: 1000, deviceScaleFactor: 1 });

  console.log("Navigating to http://localhost:3000/admin/bookings...");
  try {
    await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle0', timeout: 15000 });
  } catch (e) {
    console.log("Network idle timeout, proceeding...");
  }
  
  // Wait for react hydrate
  await new Promise(resolve => setTimeout(resolve, 2000));

  const report = await page.evaluate(() => {
    const computed = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        width: s.width,
        height: s.height,
        maxWidth: s.maxWidth,
        minWidth: s.minWidth,
        paddingLeft: s.paddingLeft,
        paddingRight: s.paddingRight,
        paddingTop: s.paddingTop,
        paddingBottom: s.paddingBottom,
        marginLeft: s.marginLeft,
        marginRight: s.marginRight,
        display: s.display,
        flexDirection: s.flexDirection,
        gap: s.gap,
        overflowX: s.overflowX,
        transform: s.transform,
        boxSizing: s.boxSizing,
        // Geometry
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          left: rect.left,
          right: rect.right
        }
      };
    };

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      html: computed('html'),
      body: computed('body'),
      layoutScale: computed('.admin-desktop-scale'),
      sidebar: computed('.admin-sidebar-desktop'),
      templateWrapper: computed('main > div > div'),
      adminContainer: computed('.admin-page-container'),
      adminHeader: computed('.admin-responsive-flex-col'),
      createButton: computed('.admin-responsive-flex-col button'),
      tableContainer: computed('.admin-table-container'),
    };
  });
  
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
