const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

async function record() {
  const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, '..', req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'text/javascript';
    if (ext === '.css') contentType = 'text/css';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  const port = await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: '/home/jules/verification/videos' }
  });

  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${port}`);
  await page.waitForTimeout(500);

  // Click 10 times to unlock Bronze trophy
  const cookieBtn = page.locator('#cookie-btn');
  for (let i = 0; i < 10; i++) {
    await cookieBtn.click();
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(1000);

  // Fast set to 99 and click once to unlock Silver trophy
  await page.evaluate(() => {
    document.cookie = 'cookieClicks=99; path=/;';
  });
  await page.reload();
  await page.waitForTimeout(500);
  await cookieBtn.click();
  await page.waitForTimeout(1000);

  // Fast set to 999 and click once to unlock Gold trophy
  await page.evaluate(() => {
    document.cookie = 'cookieClicks=999; path=/;';
  });
  await page.reload();
  await page.waitForTimeout(500);
  await cookieBtn.click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/home/jules/verification/screenshots/verification.png' });
  await page.waitForTimeout(1000);

  await context.close();
  await browser.close();
  server.close();
}

record().catch(console.error);
