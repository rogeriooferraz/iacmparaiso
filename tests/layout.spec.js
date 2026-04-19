const { chromium } = require('playwright');

async function checkLayout(device, width, height) {
  console.log(`\nStarting tests for ${device} (${width}x${height})...`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  const isSmallScreen = width <= 640;

  try {
    await page.goto('http://127.0.0.1:4173');

    await page.waitForSelector('.hero-media');
    await page.waitForSelector('.hero-nav');
    await page.waitForFunction(() => Array.isArray(window.EVENTS_DATA));
    await page.waitForTimeout(1000);

    const eventsConfig = await page.evaluate(() => window.EVENTS_DATA);
    const hasEvents = eventsConfig.length > 0;

    if (hasEvents) {
      await page.waitForFunction((expectedCount) => {
        return document.querySelectorAll('.event-entry').length === expectedCount;
      }, eventsConfig.length);
      await page.waitForSelector('.events-heading-shell h2');
      await page.waitForSelector('#eventos .event-frame');
    }

    const screenshotPath = `.codex/screenshots/verified-${device}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`- Screenshot saved to ${screenshotPath}`);

    const navBox = await (await page.$('.hero-nav')).boundingBox();
    const isButtonsVisible = (navBox.y + navBox.height) <= height;
    console.log(`- Buttons perfectly visible: ${isButtonsVisible}`);
    if (!isButtonsVisible) {
      console.error(`  ERROR: Buttons overflow the viewport on ${device}!`);
      process.exitCode = 1;
    }

    const mediaBox = await (await page.$('.hero-media')).boundingBox();
    const hasTopMargin = mediaBox.y > 0;
    const hasLeftMargin = mediaBox.x > 0;
    console.log(`- Outer beige panel has top margin: ${hasTopMargin}, left margin: ${hasLeftMargin}`);

    if (!hasTopMargin || !hasLeftMargin) {
      console.error(`  ERROR: Panel is missing outer beige margins on ${device}!`);
      process.exitCode = 1;
    }

    const metrics = await page.evaluate(() => {
      const img = document.querySelector('.hero-poster img');
      const poster = document.querySelector('.hero-poster');
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const cw = img.clientWidth;
      const ch = img.clientHeight;
      const scale = Math.min(cw / nw, ch / nh);
      const visualW = nw * scale;
      const visualH = nh * scale;
      const padTop = parseFloat(window.getComputedStyle(poster).paddingTop);
      const padLeft = parseFloat(window.getComputedStyle(poster).paddingLeft);
      return {
        whiteMarginTop: Math.round(padTop + (ch - visualH) / 2),
        whiteMarginLeft: Math.round(padLeft + (cw - visualW) / 2)
      };
    });

    console.log(`- Inner white margins -> top/bottom: ${metrics.whiteMarginTop}px, left/right: ${metrics.whiteMarginLeft}px`);

    const margins = {
      top: metrics.whiteMarginTop,
      bottom: metrics.whiteMarginTop,
      left: metrics.whiteMarginLeft,
      right: metrics.whiteMarginLeft
    };

    if (isSmallScreen) {
      if (margins.top <= 0 || margins.bottom <= 0 || margins.left <= 0 || margins.right <= 0) {
        console.error(`  ERROR: Rule 1 Failed - Not all 4 margins exist on ${device}!`);
        process.exitCode = 1;
      }

      const narrowestMargin = Math.min(margins.top, margins.bottom, margins.left, margins.right);
      if (narrowestMargin !== 8) {
        console.error(`  ERROR: Rule 2 Failed - Narrowest margin is ${narrowestMargin}px instead of 8px on ${device}!`);
        process.exitCode = 1;
      }

      if (margins.right !== margins.left) {
        console.error(`  ERROR: Rule 3 Failed - Asymmetric side margins on ${device}!`);
        process.exitCode = 1;
      }

      if (margins.top !== margins.bottom) {
        console.error(`  ERROR: Rule 4 Failed - Asymmetric vertical margins on ${device}!`);
        process.exitCode = 1;
      }
    }

    const pageState = await page.evaluate(() => {
      const section = document.querySelector('.events-section');
      const headings = Array.from(section?.querySelectorAll('.events-heading-shell h2') || []);
      const target = document.querySelector('#eventos');
      const frame = target?.querySelector('.event-frame');
      const aboutHeading = document.querySelector('#sobre h2');
      const localHeading = document.querySelector('#local h2');
      const contactHeading = document.querySelector('#contato');
      const eventsNavLink = document.querySelector('.hero-nav a[href="#eventos"]');
      const imageSources = Array.from(document.querySelectorAll('.event-image')).map((image) => {
        const src = image.getAttribute('src') || '';
        return src.replace(/^events\//, '');
      });
      const socialLinks = Array.from(document.querySelectorAll('.footer-social-links .social-link')).map((link) => ({
        href: link.getAttribute('href') || '',
        text: link.textContent?.replace(/\s+/g, ' ').trim() || ''
      }));
      return {
        eventsNavHref: eventsNavLink?.getAttribute('href') || null,
        eventsNavHidden: eventsNavLink?.hidden ?? null,
        eventsSectionHidden: section?.hidden ?? null,
        headingTexts: headings.map((heading) => heading.textContent?.trim() || ''),
        firstHeadingBeforeFrame: !!headings[0] && !!frame && (headings[0].compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        headingLeft: headings[0] ? Math.round(headings[0].getBoundingClientRect().left) : null,
        aboutHeadingLeft: aboutHeading ? Math.round(aboutHeading.getBoundingClientRect().left) : null,
        localHeadingLeft: localHeading ? Math.round(localHeading.getBoundingClientRect().left) : null,
        contactHeadingText: contactHeading ? contactHeading.textContent?.trim() || '' : '',
        contactHeadingLeft: contactHeading ? Math.round(contactHeading.getBoundingClientRect().left) : null,
        imageSources,
        socialLinks
      };
    });

    console.log(`- Eventos nav href: ${pageState.eventsNavHref}, headings: ${pageState.headingTexts.join(' | ')}`);
    console.log(`- Heading alignment -> sobre: ${pageState.aboutHeadingLeft}px, eventos: ${pageState.headingLeft}px, local: ${pageState.localHeadingLeft}px, contato: ${pageState.contactHeadingLeft}px`);

    const expectedTitles = eventsConfig.map((event) => event.title);
    const expectedFiles = eventsConfig.map((event) => event.file);

    if (hasEvents) {
      if (pageState.eventsNavHref !== '#eventos') {
        console.error(`  ERROR: Eventos button href changed on ${device}!`);
        process.exitCode = 1;
      }

      if (JSON.stringify(pageState.headingTexts) !== JSON.stringify(expectedTitles)) {
        console.error(`  ERROR: Event headings do not match assets/js/events-data.js order on ${device}!`);
        process.exitCode = 1;
      }

      if (JSON.stringify(pageState.imageSources) !== JSON.stringify(expectedFiles)) {
        console.error(`  ERROR: Event images do not match assets/js/events-data.js order on ${device}!`);
        process.exitCode = 1;
      }

      if (!pageState.firstHeadingBeforeFrame) {
        console.error(`  ERROR: First event heading is not positioned before the first image on ${device}!`);
        process.exitCode = 1;
      }

      if (Math.abs(pageState.headingLeft - pageState.localHeadingLeft) > 1) {
        console.error(`  ERROR: Eventos heading is not aligned with the Local section heading on ${device}!`);
        process.exitCode = 1;
      }
    } else {
      if (!pageState.eventsNavHidden || !pageState.eventsSectionHidden || pageState.headingTexts.length !== 0 || pageState.imageSources.length !== 0) {
        console.error(`  ERROR: Empty runtime events state is incorrect on ${device}!`);
        process.exitCode = 1;
      }
    }

    if (Math.abs(pageState.aboutHeadingLeft - pageState.localHeadingLeft) > 1) {
      console.error(`  ERROR: Sobre heading is not aligned with the Local section heading on ${device}!`);
      process.exitCode = 1;
    }

    if (pageState.contactHeadingText !== 'Igreja Aliança do Paraíso') {
      console.error(`  ERROR: Contato heading text is incorrect on ${device}!`);
      process.exitCode = 1;
    }

    if (Math.abs(pageState.contactHeadingLeft - pageState.localHeadingLeft) > 1) {
      console.error(`  ERROR: Contato heading is not aligned with the Local section heading on ${device}!`);
      process.exitCode = 1;
    }

    const expectedSocialHrefs = [
      'https://www.youtube.com/@aliancaparaiso',
      'https://www.instagram.com/aliancaparaiso/'
    ];
    const actualSocialHrefs = pageState.socialLinks.map((link) => link.href);

    if (JSON.stringify(actualSocialHrefs) !== JSON.stringify(expectedSocialHrefs)) {
      console.error(`  ERROR: Footer social links are incorrect on ${device}!`);
      process.exitCode = 1;
    }

    if (!pageState.socialLinks.every((link) => /aliancaparaiso/i.test(link.text))) {
      console.error(`  ERROR: Footer social labels are missing the channel handle on ${device}!`);
      process.exitCode = 1;
    }

    if (hasEvents) {
      await page.locator('#eventos').scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      await page.goto('http://127.0.0.1:4173');
      await page.waitForSelector('.hero-nav a[href="#eventos"]');
      await page.waitForTimeout(1000);
      await page.click('.hero-nav a[href="#eventos"]');
      await page.waitForFunction((smallScreen) => {
        const entry = document.querySelector('.event-entry');
        const target = document.querySelector('#eventos');
        const heading = document.querySelector('.events-heading-shell');
        if (!entry || !target || !heading || location.hash !== '#eventos') return false;
        if (smallScreen) {
          return target.getBoundingClientRect().top <= 2 && heading.getBoundingClientRect().top >= 6;
        }
        return entry.getBoundingClientRect().top <= 2 && heading.getBoundingClientRect().top >= 6;
      }, isSmallScreen, { timeout: 4000 });

      const anchorMetrics = await page.evaluate(() => {
        const entry = document.querySelector('.event-entry');
        const heading = document.querySelector('.events-heading-shell');
        const target = document.querySelector('#eventos');
        const image = document.querySelector('.event-image');
        const viewportHeight = window.innerHeight;
        return {
          entryTop: Math.round(entry.getBoundingClientRect().top),
          entryBottom: Math.round(entry.getBoundingClientRect().bottom),
          headingTop: Math.round(heading.getBoundingClientRect().top),
          targetTop: Math.round(target.getBoundingClientRect().top),
          imageBottom: Math.round(image.getBoundingClientRect().bottom),
          viewportHeight
        };
      });

      console.log(`- Eventos anchor -> entry top: ${anchorMetrics.entryTop}px, entry bottom: ${anchorMetrics.entryBottom}px, heading top: ${anchorMetrics.headingTop}px, target top: ${anchorMetrics.targetTop}px, image bottom: ${anchorMetrics.imageBottom}px`);

      if (isSmallScreen) {
        if (Math.abs(anchorMetrics.targetTop) > 6) {
          console.error(`  ERROR: Eventos button does not align the first event entry to the viewport on ${device}!`);
          process.exitCode = 1;
        }

        if (anchorMetrics.headingTop < 6) {
          console.error(`  ERROR: Eventos heading is not visible after anchor navigation on ${device}!`);
          process.exitCode = 1;
        }
      } else {
        if (Math.abs(anchorMetrics.entryTop) > 4) {
          console.error(`  ERROR: Eventos entry should align to the top of the viewport on large screens on ${device}!`);
          process.exitCode = 1;
        }

        if (anchorMetrics.headingTop < 6) {
          console.error(`  ERROR: Eventos heading is missing visible top white margin on large screens on ${device}!`);
          process.exitCode = 1;
        }
      }

      if (anchorMetrics.entryBottom > anchorMetrics.viewportHeight + 2) {
        console.error(`  ERROR: First event entry is taller than the viewport on ${device}!`);
        process.exitCode = 1;
      }

      if (anchorMetrics.imageBottom > anchorMetrics.viewportHeight - 6) {
        console.error(`  ERROR: Event image is missing visible bottom white margin on ${device}!`);
        process.exitCode = 1;
      }

      const eventMetrics = await page.evaluate(() => {
        const entry = document.querySelector('.event-entry');
        const frame = document.querySelector('.event-frame');
        const image = document.querySelector('.event-image');
        const entryStyle = window.getComputedStyle(entry);
        const frameStyle = window.getComputedStyle(frame);
        const imageStyle = window.getComputedStyle(image);
        const imageRect = image.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        return {
          entryPaddingTop: parseFloat(entryStyle.paddingTop),
          entryPaddingBottom: parseFloat(entryStyle.paddingBottom),
          frameDisplay: frameStyle.display,
          framePaddingTop: parseFloat(frameStyle.paddingTop),
          framePaddingRight: parseFloat(frameStyle.paddingRight),
          framePaddingBottom: parseFloat(frameStyle.paddingBottom),
          framePaddingLeft: parseFloat(frameStyle.paddingLeft),
          imageFit: imageStyle.objectFit,
          imageHeight: Math.round(imageRect.height),
          viewportHeight
        };
      });

      console.log(`- Event entry padding: ${eventMetrics.entryPaddingTop}/${eventMetrics.entryPaddingBottom}`);
      console.log(`- Event frame display: ${eventMetrics.frameDisplay}, padding: ${eventMetrics.framePaddingTop}/${eventMetrics.framePaddingRight}/${eventMetrics.framePaddingBottom}/${eventMetrics.framePaddingLeft}`);
      console.log(`- Event image height: ${eventMetrics.imageHeight}px vs viewport: ${eventMetrics.viewportHeight}px`);

      if (eventMetrics.entryPaddingTop !== 8 || eventMetrics.entryPaddingBottom !== 8) {
        console.error(`  ERROR: Event entry is missing the 8px white spacing above the heading or below the image on ${device}!`);
        process.exitCode = 1;
      }

      if (eventMetrics.frameDisplay !== 'grid') {
        console.error(`  ERROR: Event frame is not using CSS grid on ${device}!`);
        process.exitCode = 1;
      }

      const eventPadding = [
        eventMetrics.framePaddingTop,
        eventMetrics.framePaddingRight,
        eventMetrics.framePaddingBottom,
        eventMetrics.framePaddingLeft
      ];

      if (eventMetrics.imageFit !== 'contain') {
        console.error(`  ERROR: Event image is not using object-fit: contain on ${device}!`);
        process.exitCode = 1;
      }

      if (eventPadding.some((value) => value !== 8)) {
        console.error(`  ERROR: Event frame does not keep 8px margins on all sides on ${device}!`);
        process.exitCode = 1;
      }

      if (isSmallScreen && eventMetrics.imageHeight >= (eventMetrics.viewportHeight - 16)) {
        console.error(`  ERROR: Event image is ignoring the heading height on ${device}!`);
        process.exitCode = 1;
      }

      if (!isSmallScreen) {
        await page.evaluate(() => {
          window.setTimeout(() => history.back(), 0);
        });
        await page.waitForTimeout(1500);
        const backState = await page.evaluate(() => ({
          hash: location.hash,
          scrollY: Math.round(window.scrollY)
        }));
        console.log(`- Back button -> hash: "${backState.hash}", scrollY: ${backState.scrollY}`);
        if (backState.hash !== '' || backState.scrollY >= 80) {
          console.error(`  ERROR: Back button did not return to the initial screen on ${device}!`);
          process.exitCode = 1;
        }
      }
    }

    await page.goto('http://127.0.0.1:4173');
    await page.waitForSelector('.hero-nav a[href="#contato"]');
    await page.waitForTimeout(1000);
    await page.click('.hero-nav a[href="#contato"]');
    await page.waitForFunction(() => {
      const target = document.querySelector('#contato');
      const top = target?.getBoundingClientRect().top ?? Infinity;
      return location.hash === '#contato' && top >= 0 && top <= (window.innerHeight - 40);
    }, null, { timeout: 4000 });

    const contactMetrics = await page.evaluate(() => {
      const target = document.querySelector('#contato');
      const localHeading = document.querySelector('#local h2');
      return {
        text: target?.textContent?.trim() || '',
        top: Math.round(target.getBoundingClientRect().top),
        left: Math.round(target.getBoundingClientRect().left),
        localHeadingLeft: Math.round(localHeading.getBoundingClientRect().left)
      };
    });

    console.log(`- Contato anchor -> top: ${contactMetrics.top}px, left: ${contactMetrics.left}px, text: ${contactMetrics.text}`);

    if (contactMetrics.text !== 'Igreja Aliança do Paraíso') {
      console.error(`  ERROR: Contato anchor target text is incorrect on ${device}!`);
      process.exitCode = 1;
    }

    if (contactMetrics.top < 0 || contactMetrics.top > (height - 40)) {
      console.error(`  ERROR: Contato anchor did not bring the new heading into view on ${device}!`);
      process.exitCode = 1;
    }

    if (Math.abs(contactMetrics.left - contactMetrics.localHeadingLeft) > 1) {
      console.error(`  ERROR: Contato anchor target is not aligned with the Local heading on ${device}!`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`  ERROR executing test for ${device}: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

async function checkNoEventsState(label, routes) {
  console.log(`\nStarting no-events test for ${label}...`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });

  try {
    for (const routeConfig of routes) {
      await page.route(routeConfig.url, async (route) => {
        if (routeConfig.fulfill) {
          await route.fulfill(routeConfig.fulfill);
          return;
        }
        await route.abort();
      });
    }

    await page.goto('http://127.0.0.1:4173');
    await page.waitForTimeout(1500);

    const state = await page.evaluate(() => {
      const navLink = document.querySelector('.hero-nav a[href="#eventos"]');
      const section = document.querySelector('.events-section');
      return {
        navHidden: !!navLink && navLink.hidden,
        sectionHidden: !!section && section.hidden,
        eventsRendered: document.querySelectorAll('.event-entry').length
      };
    });

    console.log(`- No-events state -> nav hidden: ${state.navHidden}, section hidden: ${state.sectionHidden}, entries: ${state.eventsRendered}`);

    if (!state.navHidden || !state.sectionHidden || state.eventsRendered !== 0) {
      console.error(`  ERROR: No-events state failed for ${label}!`);
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`  ERROR executing no-events test for ${label}: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

(async () => {
  await checkLayout('desktop', 1440, 1400);
  await checkLayout('pixel7', 412, 915);
  await checkLayout('pixel5', 393, 851);
  await checkLayout('motog4', 360, 640);

  await checkNoEventsState('empty-events-data', [
    {
      url: '**/assets/js/events-data.js',
      fulfill: {
        status: 200,
        contentType: 'application/javascript',
        body: 'window.EVENTS_DATA = Object.freeze([]);'
      }
    }
  ]);

  await checkNoEventsState('missing-events-sources', [
    {
      url: '**/assets/js/events-data.js',
      fulfill: {
        status: 404,
        contentType: 'application/javascript',
        body: ''
      }
    }
  ]);

  if (process.exitCode === 1) {
    console.error('\nTests failed.');
  } else {
    console.log('\nAll layout tests passed successfully!');
  }
})();
