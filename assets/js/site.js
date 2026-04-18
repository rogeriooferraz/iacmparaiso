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

if (eventsNavLink) {
  eventsNavLink.addEventListener('click', (event) => {
    const firstEventEntry = document.querySelector('.event-entry');
    if (!desktopEventsMedia.matches || !firstEventEntry) return;

    event.preventDefault();
    desktopEventsReturnY = window.scrollY;
    if (window.location.hash !== '#eventos') {
      history.pushState(null, '', '#eventos');
    }
    const targetTop = firstEventEntry.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: Math.max(0, targetTop - 24),
      behavior: 'smooth'
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
      title: event.title.trim()
    }))
    .filter((event) => event.file && event.title);
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

  const image = document.createElement('img');
  image.className = 'event-image';
  image.src = `events/${event.file}`;
  image.alt = `Cartaz do evento ${event.title}`;
  image.addEventListener('error', () => {
    console.warn(`Event image not found: ${image.src}`);
    removeEventEntry(entry);
  }, { once: true });

  frame.appendChild(image);
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
