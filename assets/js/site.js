const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const siteHeader = document.getElementById('siteHeader');
const eventsList = document.getElementById('eventsList');
const eventsSection = document.querySelector('.events-section');
const desktopEventsMedia = window.matchMedia('(min-width: 641px)');
let desktopEventsReturnY = 0;

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const eventsNavLink = document.querySelector('.hero-nav a[href="#eventos"]');
let descriptionSyncFrame = 0;

function syncEventViewportVars() {
  document.documentElement.style.setProperty('--event-description-collapsed-max', `${Math.round(window.innerHeight * 0.4)}px`);
}

if (eventsNavLink) {
  eventsNavLink.addEventListener('click', (event) => {
    const firstEventEntry = document.querySelector('.event-entry');
    if (!desktopEventsMedia.matches || !firstEventEntry) return;

    event.preventDefault();
    desktopEventsReturnY = window.scrollY;
    if (eventsSection) {
      eventsSection.classList.add('visible');
      eventsSection.style.transition = 'none';
      eventsSection.style.opacity = '1';
      eventsSection.style.transform = 'translateY(0)';
    }
    if (window.location.hash !== '#eventos') {
      history.pushState(null, '', '#eventos');
    }
    requestAnimationFrame(() => {
      const targetTop = firstEventEntry.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
    });
  });
}

window.addEventListener('popstate', () => {
  if (desktopEventsMedia.matches && window.location.hash === '') {
    window.scrollTo({ top: desktopEventsReturnY, behavior: 'auto' });
  }
});

function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];

  return events
    .filter((event) => event && typeof event.file === 'string' && typeof event.title === 'string')
    .map((event) => ({
      file: event.file.trim(),
      title: event.title.trim(),
      description: typeof event.description === 'string' ? event.description.trim() : ''
    }))
    .filter((event) => event.file && event.title);
}

function setDescriptionExpanded(shell, expanded) {
  if (!shell) return;

  const toggle = shell.querySelector('.event-description-toggle');
  shell.classList.toggle('expanded', expanded);

  if (toggle) {
    const label = expanded ? 'Ocultar descrição completa do evento' : 'Mostrar descrição completa do evento';
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }
}

function syncDescriptionToggle(shell) {
  if (!shell) return;

  const description = shell.querySelector('.event-description');
  const toggle = shell.querySelector('.event-description-toggle');
  if (!description || !toggle) return;

  const shouldRestoreExpanded = shell.classList.contains('expanded');
  shell.classList.remove('expanded');

  const hasOverflow = (description.scrollHeight - description.clientHeight) > 1;
  shell.dataset.overflow = String(hasOverflow);
  toggle.hidden = !hasOverflow;
  toggle.disabled = !hasOverflow;

  if (!hasOverflow) {
    setDescriptionExpanded(shell, false);
    return;
  }

  setDescriptionExpanded(shell, shouldRestoreExpanded);
}

function syncAllDescriptionToggles() {
  document.querySelectorAll('.event-description-shell').forEach((shell) => {
    syncDescriptionToggle(shell);
  });
}

function queueDescriptionSync() {
  if (descriptionSyncFrame) {
    cancelAnimationFrame(descriptionSyncFrame);
  }

  descriptionSyncFrame = requestAnimationFrame(() => {
    descriptionSyncFrame = 0;
    syncEventViewportVars();
    syncAllDescriptionToggles();
  });
}

function updateEventsVisibility() {
  if (!eventsList) return;

  const hasEvents = eventsList.children.length > 0;

  if (eventsNavLink) {
    eventsNavLink.hidden = !hasEvents;
  }

  if (eventsSection) {
    eventsSection.hidden = !hasEvents;
  }
}

function removeEventEntry(entry) {
  if (!entry?.isConnected) return;

  entry.remove();
  updateEventsVisibility();
  document.dispatchEvent(new CustomEvent('events:loaded'));
}

function buildEventEntry(event, index) {
  const entry = document.createElement('article');
  entry.className = 'event-entry';
  if (index === 0) {
    entry.id = 'eventos';
  }

  const headingShell = document.createElement('div');
  headingShell.className = 'container location-box events-heading-shell';

  const heading = document.createElement('h2');
  heading.textContent = event.title;
  headingShell.appendChild(heading);

  const grid = document.createElement('div');
  grid.className = 'events-grid';

  const card = document.createElement('div');
  card.className = 'event-card';

  const frame = document.createElement('div');
  frame.className = 'event-frame';

  const content = document.createElement('div');
  content.className = 'event-content';

  const visual = document.createElement('div');
  visual.className = 'event-visual';

  const image = document.createElement('img');
  image.className = 'event-image';
  image.src = `assets/events/${event.file}`;
  image.alt = `Cartaz do evento ${event.title}`;
  image.addEventListener('load', queueDescriptionSync, { once: true });
  image.addEventListener('error', () => {
    console.warn(`Event image not found: ${image.src}`);
    removeEventEntry(entry);
  }, { once: true });

  visual.appendChild(image);
  content.appendChild(visual);

  if (event.description) {
    const descriptionShell = document.createElement('div');
    descriptionShell.className = 'event-description-shell';

    const description = document.createElement('p');
    description.className = 'event-description';
    description.textContent = event.description;

    const actions = document.createElement('div');
    actions.className = 'event-description-actions';

    const toggle = document.createElement('button');
    toggle.className = 'event-description-toggle';
    toggle.type = 'button';
    toggle.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Mostrar descrição completa do evento');
    toggle.title = 'Mostrar descrição completa do evento';
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6.47 8.97a.75.75 0 0 1 1.06 0L12 13.44l4.47-4.47a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 0 1 0-1.06Z"></path>
      </svg>
      <span class="sr-only">Expandir descrição</span>
    `;
    toggle.addEventListener('click', () => {
      setDescriptionExpanded(descriptionShell, !descriptionShell.classList.contains('expanded'));
      queueDescriptionSync();
    });

    actions.appendChild(toggle);
    descriptionShell.append(description, actions);
    content.appendChild(descriptionShell);
  }

  frame.appendChild(content);
  card.appendChild(frame);
  grid.appendChild(card);
  entry.append(headingShell, grid);

  return entry;
}

function renderEvents(events) {
  if (!eventsList) return;

  eventsList.replaceChildren();

  events.forEach((event, index) => {
    eventsList.appendChild(buildEventEntry(event, index));
  });

  updateEventsVisibility();
  queueDescriptionSync();
  document.dispatchEvent(new CustomEvent('events:loaded'));
}

function loadEvents() {
  if (!eventsList) return;

  const events = sanitizeEvents(window.EVENTS_DATA);
  renderEvents(events);
}

window.addEventListener('scroll', () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

const heroImage = document.querySelector('.hero-media img');
if (heroImage) {
  const src = heroImage.getAttribute('src') || '';
  document.body.classList.toggle('hero-painel', src.includes('painel.jpeg'));
}

const floatingCards = document.querySelectorAll('.floating-card');
floatingCards.forEach((card) => {
  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 6;
    const rotateX = ((y / rect.height) - 0.5) * -6;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});

loadEvents();

syncEventViewportVars();
window.addEventListener('resize', queueDescriptionSync, { passive: true });
