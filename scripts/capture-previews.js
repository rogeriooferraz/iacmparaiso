const fs = require('fs/promises');
const path = require('path');
const { chromium } = require('playwright');

const baseUrl = process.env.SCREENSHOT_URL || 'http://127.0.0.1:4173';
const outputDir = path.resolve(__dirname, '..', '.codex', 'screenshots');

const targets = [
  {
    name: 'preview-desktop',
    viewport: { width: 1440, height: 1400 },
    captures: [
      { name: 'home', fullPage: false },
      { name: 'eventos', selector: '.events-section', padding: 12 },
      { name: 'contato', selector: '.site-footer', padding: 12 }
    ]
  },
  {
    name: 'preview-pixel7',
    viewport: { width: 412, height: 915 },
    isMobile: true,
    deviceScaleFactor: 2.625,
    hasTouch: true,
    captures: [
      { name: 'home', fullPage: false },
      { name: 'eventos', selector: '.events-section', padding: 8 },
      { name: 'contato', selector: '.site-footer', padding: 8 }
    ]
  },
  {
    name: 'preview-motog4',
    viewport: { width: 360, height: 640 },
    isMobile: true,
    deviceScaleFactor: 3,
    hasTouch: true,
    captures: [
      { name: 'home', fullPage: false },
      { name: 'eventos', selector: '.events-section', padding: 8 },
      { name: 'contato', selector: '.site-footer', padding: 8 }
    ]
  }
];

async function waitForPageReady(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForSelector('.hero-media');
  await page.waitForSelector('.hero-nav');
  await page.waitForFunction(() => Array.isArray(window.EVENTS_DATA));
  await page.waitForTimeout(1000);
}

async function capturePage(page, target, capture) {
  const outputPath = path.join(outputDir, `${target.name}-${capture.name}.png`);

  if (!capture.selector) {
    await page.screenshot({ path: outputPath, fullPage: !!capture.fullPage });
    console.log(outputPath);
    return;
  }

  const locator = page.locator(capture.selector);
  if (await locator.count() === 0) {
    return;
  }

  if (!(await locator.first().isVisible())) {
    return;
  }

  await locator.first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await locator.first().screenshot({ path: outputPath });
  console.log(outputPath);
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();

  try {
    for (const target of targets) {
      const context = await browser.newContext({
        viewport: target.viewport,
        isMobile: target.isMobile || false,
        deviceScaleFactor: target.deviceScaleFactor || 1,
        hasTouch: target.hasTouch || false
      });
      const page = await context.newPage();

      try {
        await waitForPageReady(page);
        for (const capture of target.captures) {
          await capturePage(page, target, capture);
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
