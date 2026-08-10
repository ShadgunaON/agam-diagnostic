import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/admin/bookings');
  
  try {
    await page.goto('http://localhost:3000/admin/bookings', { waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
    console.log('Timeout waiting for network idle, but proceeding...');
  }

  // Get viewport dimensions
  const viewportSize = await page.evaluate(() => {
    return { width: window.innerWidth, height: window.innerHeight };
  });
  console.log('Viewport:', viewportSize);

  // 1. Get main container padding and gap
  const containerStyle = await page.evaluate(() => {
    const el = document.querySelector('.admin-page-container');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      padding: style.padding,
      gap: style.gap
    };
  });
  console.log('Container Style (lg:p-10, lg:gap-8):', containerStyle);

  // 2. Get Header/Filter container flex direction
  const filterStyle = await page.evaluate(() => {
    const el = document.querySelector('.admin-responsive-flex-col');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      flexDirection: style.flexDirection
    };
  });
  console.log('Header/Filter Style (lg:flex-row):', filterStyle);

  // 3. Get Button width
  const buttonStyle = await page.evaluate(() => {
    const el = document.querySelector('button'); // First button is usually the create booking button
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      width: style.width
    };
  });
  console.log('Button Style (lg:w-auto):', buttonStyle);

  // 4. Get Table container padding
  const tableContainerStyle = await page.evaluate(() => {
    const el = document.querySelector('.admin-table-container');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      padding: style.padding
    };
  });
  console.log('Table Container Style (lg:p-8):', tableContainerStyle);

  // 5. Get Table Row grid columns
  const tableRowStyle = await page.evaluate(() => {
    const el = document.querySelector('.admin-table-row');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns
    };
  });
  console.log('Table Row Style (lg:grid-cols-[...]):', tableRowStyle);

  await browser.close();
})();
