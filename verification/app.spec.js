const { test, expect } = require('@playwright/test');
const http = require('http');
const fs = require('fs');
const path = require('path');

let server;
let PORT = 8080;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
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

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      PORT = server.address().port;
      resolve();
    });
  });
});

test.afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

test.describe('Cookie Clicker Web App Verification', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`http://127.0.0.1:${PORT}`);
  });

  test('should initialize count to 0 and trophies to locked state', async ({ page }) => {
    const counter = page.locator('#click-count');
    await expect(counter).toHaveText('0');

    const trophy10 = page.locator('#trophy-10');
    const trophy100 = page.locator('#trophy-100');
    const trophy1000 = page.locator('#trophy-1000');

    await expect(trophy10).toHaveClass(/locked/);
    await expect(trophy100).toHaveClass(/locked/);
    await expect(trophy1000).toHaveClass(/locked/);
  });

  test('should increment counter when clicking cookie', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    const counter = page.locator('#click-count');

    await cookieBtn.click();
    await expect(counter).toHaveText('1');

    await cookieBtn.click();
    await expect(counter).toHaveText('2');
  });

  test('should persist click count via cookie on page reload', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    const counter = page.locator('#click-count');

    for (let i = 0; i < 5; i++) {
      await cookieBtn.click();
    }
    await expect(counter).toHaveText('5');

    await page.reload();
    await expect(counter).toHaveText('5');
  });

  test('should unlock Bronze trophy at 10 clicks', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    const trophy10 = page.locator('#trophy-10');
    const trophy100 = page.locator('#trophy-100');

    for (let i = 0; i < 10; i++) {
      await cookieBtn.click();
    }

    await expect(page.locator('#click-count')).toHaveText('10');
    await expect(trophy10).toHaveClass(/unlocked/);
    await expect(trophy100).toHaveClass(/locked/);
  });

  test('should unlock Silver trophy at 100 clicks', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    const trophy10 = page.locator('#trophy-10');
    const trophy100 = page.locator('#trophy-100');
    const trophy1000 = page.locator('#trophy-1000');

    // Simulate 100 clicks quickly
    await page.evaluate(() => {
      document.cookie = 'cookieClicks=99; path=/;';
    });
    await page.reload();
    await expect(page.locator('#click-count')).toHaveText('99');

    await cookieBtn.click();

    await expect(page.locator('#click-count')).toHaveText('100');
    await expect(trophy10).toHaveClass(/unlocked/);
    await expect(trophy100).toHaveClass(/unlocked/);
    await expect(trophy1000).toHaveClass(/locked/);
  });

  test('should unlock Gold trophy at 1000 clicks', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    const trophy1000 = page.locator('#trophy-1000');

    await page.evaluate(() => {
      document.cookie = 'cookieClicks=999; path=/;';
    });
    await page.reload();
    await expect(page.locator('#click-count')).toHaveText('999');
    await expect(trophy1000).toHaveClass(/locked/);

    await cookieBtn.click();
    await expect(page.locator('#click-count')).toHaveText('1000');
    await expect(trophy1000).toHaveClass(/unlocked/);
  });

  test('should reset click count and lock trophies when reset button is clicked', async ({ page }) => {
    const cookieBtn = page.locator('#cookie-btn');
    const resetBtn = page.locator('#reset-btn');
    const trophy10 = page.locator('#trophy-10');

    for (let i = 0; i < 10; i++) {
      await cookieBtn.click();
    }
    await expect(trophy10).toHaveClass(/unlocked/);

    await resetBtn.click();
    await expect(page.locator('#click-count')).toHaveText('0');
    await expect(trophy10).toHaveClass(/locked/);
  });
});
