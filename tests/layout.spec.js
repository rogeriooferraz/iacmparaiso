const { chromium } = require('playwright');

function normalizeEventDescriptionMarkup(description) {
  return String(description || '')
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function checkDesktopEventsSecondClick(page, device) {
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

  await page.click('.hero-nav a[href="#eventos"]');
  await page.waitForTimeout(1500);

  const secondClickState = await page.evaluate(() => ({
    hash: location.hash,
    entryTop: Math.round(document.querySelector('.event-entry').getBoundingClientRect().top),
    contentBottom: Math.round(document.querySelector('.event-content').getBoundingClientRect().bottom),
    viewportHeight: window.innerHeight
  }));
  console.log(`- Second eventos click -> hash: "${secondClickState.hash}", entry top: ${secondClickState.entryTop}, content bottom: ${secondClickState.contentBottom}`);

  if (secondClickState.hash !== '#eventos' || Math.abs(secondClickState.entryTop) > 8) {
    console.error(`  ERROR: Second Eventos click does not return to the correct anchored state on ${device}!`);
    process.exitCode = 1;
  }

  if (secondClickState.contentBottom > secondClickState.viewportHeight - 6) {
    console.error(`  ERROR: Second Eventos click loses the visible bottom white margin on ${device}!`);
    process.exitCode = 1;
  }
}

async function checkLongDescriptionToggle() {
  console.log(`\nStarting long-description toggle test...`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

  try {
    await page.route('**/assets/js/events-data.js', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `window.EVENTS_DATA = Object.freeze([{ file: "3-piquenique-cientec-2026.jpeg", title: "Piquenique e Brincadeiras no CIENTEC!", description: "${'A IACM Paraíso convida famílias, vizinhos, amigos e crianças para um tempo de convivência, brincadeiras, conversa, lanche e comunhão no CIENTEC. '.repeat(8)}" }]);`
      });
    });

    await page.goto('http://127.0.0.1:4173');
    await page.waitForSelector('.hero-nav a[href="#eventos"]');
    await page.waitForTimeout(1000);
    await page.click('.hero-nav a[href="#eventos"]');
    await page.waitForSelector('.event-description-toggle:not([hidden])');

    const collapsed = await page.evaluate(() => {
      const description = document.querySelector('.event-description');
      const shell = document.querySelector('.event-description-shell');
      const toggle = document.querySelector('.event-description-toggle');
      const image = document.querySelector('.event-image');
      return {
        descriptionTop: Math.round(description.getBoundingClientRect().top),
        imageBottom: Math.round(image.getBoundingClientRect().bottom),
        clientHeight: Math.round(description.clientHeight),
        scrollHeight: Math.round(description.scrollHeight),
        viewportHeight: window.innerHeight,
        expanded: shell.classList.contains('expanded'),
        ariaExpanded: toggle.getAttribute('aria-expanded')
      };
    });

    console.log(`- Long description collapsed -> image bottom: ${collapsed.imageBottom}, description top: ${collapsed.descriptionTop}, client: ${collapsed.clientHeight}, scroll: ${collapsed.scrollHeight}`);

    if (collapsed.descriptionTop <= collapsed.imageBottom) {
      console.error('  ERROR: Event description is not rendered after the image in the long-description state!');
      process.exitCode = 1;
    }

    if (collapsed.clientHeight >= collapsed.scrollHeight || collapsed.expanded || collapsed.ariaExpanded !== 'false') {
      console.error('  ERROR: Long event description is not collapsed before interaction!');
      process.exitCode = 1;
    }

    if (collapsed.clientHeight > Math.ceil(collapsed.viewportHeight * 0.4) + 2) {
      console.error('  ERROR: Collapsed event description exceeds 40% of the viewport height!');
      process.exitCode = 1;
    }

    await page.click('.event-description-toggle');
    await page.waitForTimeout(250);

    const expanded = await page.evaluate(() => {
      const description = document.querySelector('.event-description');
      const shell = document.querySelector('.event-description-shell');
      const toggle = document.querySelector('.event-description-toggle');
      return {
        clientHeight: Math.round(description.clientHeight),
        scrollHeight: Math.round(description.scrollHeight),
        overflowY: window.getComputedStyle(description).overflowY,
        expanded: shell.classList.contains('expanded'),
        ariaExpanded: toggle.getAttribute('aria-expanded')
      };
    });

    console.log(`- Long description expanded -> client: ${expanded.clientHeight}, scroll: ${expanded.scrollHeight}, overflowY: ${expanded.overflowY}`);

    if (!expanded.expanded || expanded.ariaExpanded !== 'true') {
      console.error('  ERROR: Long event description did not switch to the expanded state after tapping the icon!');
      process.exitCode = 1;
    }

    if (expanded.clientHeight <= collapsed.clientHeight || expanded.clientHeight < expanded.scrollHeight - 2) {
      console.error('  ERROR: Expanded long event description did not grow to reveal the remaining text!');
      process.exitCode = 1;
    }

    if (expanded.overflowY !== 'visible') {
      console.error('  ERROR: Expanded long event description is still constrained to an internal scroll area!');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`  ERROR executing long-description toggle test: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

async function checkDescriptionHtmlRendering() {
  console.log(`\nStarting description HTML rendering test...`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 412, height: 915 } });

  try {
    await page.route('**/assets/js/events-data.js', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `window.EVENTS_DATA = Object.freeze([{ file: "3-piquenique-cientec-2026.jpeg", title: "Piquenique e Brincadeiras no CIENTEC!", description: "Linha inicial<br><strong>Local de encontro:</strong> Entrada do Parque CIENTEC às 9:00<br><a href=\\"https://maps.app.goo.gl/bCqDB2y4poRDVUit5\\" target=\\"_blank\\">Clique aqui para ver o mapa</a>" }]);`
      });
    });

    await page.goto('http://127.0.0.1:4173');
    await page.waitForSelector('.hero-nav a[href="#eventos"]');
    await page.waitForTimeout(1000);
    await page.click('.hero-nav a[href="#eventos"]');
    await page.waitForSelector('.event-description strong');
    await page.waitForSelector('.event-description a');

    const state = await page.evaluate(() => {
      const description = document.querySelector('.event-description');
      const strong = description?.querySelector('strong');
      const link = description?.querySelector('a');
      return {
        html: description?.innerHTML || '',
        text: description?.textContent?.replace(/\s+/g, ' ').trim() || '',
        strongText: strong?.textContent?.trim() || '',
        linkText: link?.textContent?.trim() || '',
        linkHref: link?.getAttribute('href') || '',
        linkTarget: link?.getAttribute('target') || ''
      };
    });

    console.log(`- Description HTML -> strong: "${state.strongText}", link: "${state.linkText}", href: "${state.linkHref}"`);

    if (!state.html.includes('<strong>') || !state.html.includes('<a ')) {
      console.error('  ERROR: Event description HTML is not being rendered as markup!');
      process.exitCode = 1;
    }

    if (state.strongText !== 'Local de encontro:') {
      console.error('  ERROR: Event description strong label did not render correctly!');
      process.exitCode = 1;
    }

    if (state.linkText !== 'Clique aqui para ver o mapa' || state.linkHref !== 'https://maps.app.goo.gl/bCqDB2y4poRDVUit5' || state.linkTarget !== '_blank') {
      console.error('  ERROR: Event description link did not render correctly!');
      process.exitCode = 1;
    }

    if (!state.text.includes('Linha inicial') || !state.text.includes('Local de encontro:') || !state.text.includes('Clique aqui para ver o mapa')) {
      console.error('  ERROR: Event description rendered text content is incomplete!');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error(`  ERROR executing description HTML rendering test: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

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
      const horariosTag = document.querySelector('#horarios .section-tag');
      const horariosCard = document.querySelector('#horarios .info-card');
      const localHeading = document.querySelector('#local h2');
      const contactHeading = document.querySelector('#contato');
      const eventsNavLink = document.querySelector('.hero-nav a[href="#eventos"]');
      const eventsTag = document.querySelector('.events-section .section-tag');
      const sectionTag = document.querySelector('#sobre .section-tag');
      const sectionTagStyle = sectionTag ? window.getComputedStyle(sectionTag) : null;
      const imageSources = Array.from(document.querySelectorAll('.event-image')).map((image) => {
        const src = image.getAttribute('src') || '';
        return src.replace(/^assets\/events\//, '');
      });
      const descriptions = Array.from(document.querySelectorAll('.event-description')).map((description) => description.textContent?.replace(/\s+/g, ' ').trim() || '');
      const descriptionHeights = Array.from(document.querySelectorAll('.event-description')).map((description) => Math.round(description.getBoundingClientRect().height));
      const descriptionTextAligns = Array.from(document.querySelectorAll('.event-description')).map((description) => window.getComputedStyle(description).textAlign);
      const descriptionPlacements = Array.from(document.querySelectorAll('.event-entry')).map((entry) => {
        const image = entry.querySelector('.event-image');
        const description = entry.querySelector('.event-description');
        if (!image || !description) {
          return null;
        }
        return Math.round(description.getBoundingClientRect().top) > Math.round(image.getBoundingClientRect().bottom);
      });
      const socialLinks = Array.from(document.querySelectorAll('.footer-social-links .social-link')).map((link) => ({
        href: link.getAttribute('href') || '',
        text: link.textContent?.replace(/\s+/g, ' ').trim() || ''
      }));
      return {
        eventsNavHref: eventsNavLink?.getAttribute('href') || null,
        eventsNavHidden: eventsNavLink?.hidden ?? null,
        eventsSectionHidden: section?.hidden ?? null,
        sectionTagPointerEvents: sectionTagStyle?.pointerEvents || null,
        sectionTagTextTransform: sectionTagStyle?.textTransform || null,
        sectionTagBorderRadius: sectionTagStyle?.borderRadius || null,
        headingTexts: headings.map((heading) => heading.textContent?.trim() || ''),
        horariosTagText: horariosTag?.textContent?.trim() || '',
        horariosTagLeft: horariosTag ? Math.round(horariosTag.getBoundingClientRect().left) : null,
        horariosCardLeft: horariosCard ? Math.round(horariosCard.getBoundingClientRect().left) : null,
        eventsTagText: eventsTag?.textContent?.trim() || '',
        eventsTagLeft: eventsTag ? Math.round(eventsTag.getBoundingClientRect().left) : null,
        firstHeadingBeforeFrame: !!headings[0] && !!frame && (headings[0].compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
        headingLeft: headings[0] ? Math.round(headings[0].getBoundingClientRect().left) : null,
        aboutHeadingLeft: aboutHeading ? Math.round(aboutHeading.getBoundingClientRect().left) : null,
        localHeadingLeft: localHeading ? Math.round(localHeading.getBoundingClientRect().left) : null,
        contactHeadingText: contactHeading ? contactHeading.textContent?.trim() || '' : '',
        contactHeadingLeft: contactHeading ? Math.round(contactHeading.getBoundingClientRect().left) : null,
        imageSources,
        descriptions,
        descriptionHeights,
        descriptionTextAligns,
        descriptionPlacements,
        socialLinks
      };
    });

    console.log(`- Eventos nav href: ${pageState.eventsNavHref}, headings: ${pageState.headingTexts.join(' | ')}`);
    console.log(`- Heading alignment -> sobre: ${pageState.aboutHeadingLeft}px, eventos: ${pageState.headingLeft}px, local: ${pageState.localHeadingLeft}px, contato: ${pageState.contactHeadingLeft}px`);

    const expectedTitles = eventsConfig.map((event) => event.title);
    const expectedFiles = eventsConfig.map((event) => event.file);
    const expectedDescriptions = eventsConfig
      .map((event) => typeof event.description === 'string' ? normalizeEventDescriptionMarkup(event.description) : '')
      .filter(Boolean);

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

      if (JSON.stringify(pageState.descriptions) !== JSON.stringify(expectedDescriptions)) {
        console.error(`  ERROR: Event descriptions do not match assets/js/events-data.js content on ${device}!`);
        process.exitCode = 1;
      }

      if (!pageState.firstHeadingBeforeFrame) {
        console.error(`  ERROR: First event heading is not positioned before the first image on ${device}!`);
        process.exitCode = 1;
      }

      if (pageState.descriptionPlacements.some((value) => value === false)) {
        console.error(`  ERROR: Event description is not positioned after its image on ${device}!`);
        process.exitCode = 1;
      }

      if (expectedDescriptions.length > 0 && pageState.descriptionHeights.some((value) => value <= 0)) {
        console.error(`  ERROR: Event description has zero visible height on ${device}!`);
        process.exitCode = 1;
      }

      if (expectedDescriptions.length > 0 && pageState.descriptionTextAligns.some((value) => value !== 'center')) {
        console.error(`  ERROR: Event description text is not centered on ${device}!`);
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

    if (pageState.sectionTagPointerEvents !== 'none' || pageState.sectionTagTextTransform !== 'uppercase' || pageState.sectionTagBorderRadius !== '0px') {
      console.error(`  ERROR: Section tag styling regressed and may look interactive on ${device}!`);
      process.exitCode = 1;
    }

    if (pageState.horariosTagText !== 'Horários') {
      console.error(`  ERROR: Horarios section tag is incorrect on ${device}!`);
      process.exitCode = 1;
    }

    if (Math.abs(pageState.horariosCardLeft - pageState.localHeadingLeft) > 1) {
      console.error(`  ERROR: Horarios cards are not aligned with the Local section heading on ${device}!`);
      process.exitCode = 1;
    }

    if (Math.abs(pageState.horariosTagLeft - pageState.horariosCardLeft) > 1) {
      console.error(`  ERROR: Horarios section tag is not aligned with its cards on ${device}!`);
      process.exitCode = 1;
    }

    if (pageState.eventsTagText !== 'Eventos') {
      console.error(`  ERROR: Eventos section tag is incorrect on ${device}!`);
      process.exitCode = 1;
    }

    if (hasEvents && Math.abs(pageState.eventsTagLeft - pageState.headingLeft) > 1) {
      console.error(`  ERROR: Eventos section tag is not aligned with the event heading on ${device}!`);
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
          return Math.abs(target.getBoundingClientRect().top) <= 16 && heading.getBoundingClientRect().top >= 0;
        }
        return Math.abs(entry.getBoundingClientRect().top) <= 8 && heading.getBoundingClientRect().top >= 0;
      }, isSmallScreen, { timeout: 6000 });

      const anchorMetrics = await page.evaluate(() => {
        const entry = document.querySelector('.event-entry');
        const heading = document.querySelector('.events-heading-shell');
        const target = document.querySelector('#eventos');
        const image = document.querySelector('.event-image');
        const content = document.querySelector('.event-content');
        const viewportHeight = window.innerHeight;
        return {
          entryTop: Math.round(entry.getBoundingClientRect().top),
          entryBottom: Math.round(entry.getBoundingClientRect().bottom),
          headingTop: Math.round(heading.getBoundingClientRect().top),
          targetTop: Math.round(target.getBoundingClientRect().top),
          imageBottom: Math.round(image.getBoundingClientRect().bottom),
          contentBottom: Math.round(content.getBoundingClientRect().bottom),
          viewportHeight
        };
      });

      console.log(`- Eventos anchor -> entry top: ${anchorMetrics.entryTop}px, entry bottom: ${anchorMetrics.entryBottom}px, heading top: ${anchorMetrics.headingTop}px, target top: ${anchorMetrics.targetTop}px, image bottom: ${anchorMetrics.imageBottom}px, content bottom: ${anchorMetrics.contentBottom}px`);

      if (isSmallScreen) {
        if (Math.abs(anchorMetrics.targetTop) > 16) {
          console.error(`  ERROR: Eventos button does not align the first event entry to the viewport on ${device}!`);
          process.exitCode = 1;
        }

        if (anchorMetrics.headingTop < 6) {
          console.error(`  ERROR: Eventos heading is not visible after anchor navigation on ${device}!`);
          process.exitCode = 1;
        }
      } else {
        if (Math.abs(anchorMetrics.entryTop) > 8) {
          console.error(`  ERROR: Eventos entry should align to the top of the viewport on large screens on ${device}!`);
          process.exitCode = 1;
        }

        if (anchorMetrics.headingTop < 6) {
          console.error(`  ERROR: Eventos heading is missing visible top white margin on large screens on ${device}!`);
          process.exitCode = 1;
        }
      }

      const entryBottomTolerance = isSmallScreen ? 16 : 8;
      if (anchorMetrics.entryBottom > anchorMetrics.viewportHeight + entryBottomTolerance) {
        console.error(`  ERROR: First event entry is taller than the viewport on ${device}!`);
        process.exitCode = 1;
      }

      if (anchorMetrics.contentBottom > anchorMetrics.viewportHeight - 6) {
        console.error(`  ERROR: Event content is missing visible bottom white margin on ${device}!`);
        process.exitCode = 1;
      }

      const eventMetrics = await page.evaluate(() => {
        const entry = document.querySelector('.event-entry');
        const frame = document.querySelector('.event-frame');
        const image = document.querySelector('.event-image');
        const content = document.querySelector('.event-content');
        const description = document.querySelector('.event-description');
        const descriptionToggle = document.querySelector('.event-description-toggle');
        const entryStyle = window.getComputedStyle(entry);
        const frameStyle = window.getComputedStyle(frame);
        const imageStyle = window.getComputedStyle(image);
        const contentStyle = window.getComputedStyle(content);
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
          contentGap: parseFloat(contentStyle.gap),
          imageFit: imageStyle.objectFit,
          imageHeight: Math.round(imageRect.height),
          viewportHeight,
          descriptionExists: !!description,
          descriptionToggleExists: !!descriptionToggle
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

      if (eventMetrics.contentGap !== 12) {
        console.error(`  ERROR: Event content gap changed unexpectedly on ${device}!`);
        process.exitCode = 1;
      }

      if (expectedDescriptions.length > 0 && (!eventMetrics.descriptionExists || !eventMetrics.descriptionToggleExists)) {
        console.error(`  ERROR: Event description UI is missing on ${device}!`);
        process.exitCode = 1;
      }

      if (isSmallScreen && eventMetrics.imageHeight >= (eventMetrics.viewportHeight - 16)) {
        console.error(`  ERROR: Event image is ignoring the heading height on ${device}!`);
        process.exitCode = 1;
      }

      if (!isSmallScreen) {
        await checkDesktopEventsSecondClick(page, device);
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
        navDisplay: navLink ? window.getComputedStyle(navLink).display : null,
        sectionHidden: !!section && section.hidden,
        sectionDisplay: section ? window.getComputedStyle(section).display : null,
        eventsRendered: document.querySelectorAll('.event-entry').length
      };
    });

    console.log(`- No-events state -> nav hidden: ${state.navHidden}, section hidden: ${state.sectionHidden}, entries: ${state.eventsRendered}`);

    if (!state.navHidden || state.navDisplay !== 'none' || !state.sectionHidden || state.sectionDisplay !== 'none' || state.eventsRendered !== 0) {
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
  await checkLongDescriptionToggle();
  await checkDescriptionHtmlRendering();

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
