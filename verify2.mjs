import { chromium } from 'playwright';

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1700, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000/admin/bookings...");
  try {
    await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log("Network idle timeout, proceeding...");
  }
  
  // Let react hydrate
  await page.waitForTimeout(2000);

  const report = await page.evaluate(() => {
    const computed = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = window.getComputedStyle(el);
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
      adminContainer: computed('.admin-page-container'),
      adminHeader: computed('.admin-responsive-flex-col'),
      createButton: computed('.admin-responsive-flex-col button'),
      tableContainer: computed('.admin-table-row')?.parent || null, 
    };
  });
  
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
