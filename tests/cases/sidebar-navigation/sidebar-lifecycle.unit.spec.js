/**
 * Unit tests: SidebarNav lifecycle (open/close/toggle, overlay, Escape, focus).
 * Requirements: 1.2, 1.3, 1.5, 1.6, 3.5 — Correctness Property P3 (aria-expanded).
 */
const SidebarNav = require('../../../scripts/script-sidebar.js');

function buildDom() {
  document.body.innerHTML = `
    <button id="sidebarToggle" aria-expanded="false" aria-controls="appSidebar"></button>
    <div id="sidebarOverlay" class="sidebar-overlay" hidden></div>
    <nav id="appSidebar" class="app-sidebar">
      <button class="sidebar-close"></button>
      <ul class="sidebar-links">
        <li><a href="#metronomeContainer" data-popup="metronome">Metrônomo</a></li>
        <li><a href="#fretboardContainer">Braço</a></li>
      </ul>
    </nav>
    <!-- selects needed by setupSelectorSync (won't be exercised here) -->
    <select id="tonica"><option value="C" selected>C</option></select>
    <select id="tipoEscala"><option value="maior" selected>Maior</option></select>
    <select id="topbarTonica"></select>
    <select id="topbarEscala"></select>
    <div id="metronomeContainer"></div>
    <div id="fretboardContainer"></div>
  `;
  SidebarNav.init();
}

describe('SidebarNav lifecycle', () => {
  beforeEach(() => {
    buildDom();
    document.body.className = '';
  });

  afterEach(() => {
    if (SidebarNav.isOpen()) SidebarNav.close();
    document.body.className = '';
    document.body.innerHTML = '';
  });

  it('starts closed', () => {
    expect(SidebarNav.isOpen()).toBe(false);
    expect(document.getElementById('sidebarToggle').getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('sidebarOverlay').hidden).toBe(true);
  });

  it('open() opens the sidebar and sets aria-expanded=true (P3)', () => {
    SidebarNav.open();
    expect(SidebarNav.isOpen()).toBe(true);
    expect(document.body.classList.contains('sidebar-open')).toBe(true);
    expect(document.getElementById('sidebarToggle').getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById('sidebarOverlay').hidden).toBe(false);
  });

  it('close() closes the sidebar and resets aria-expanded=false (P3)', () => {
    SidebarNav.open();
    SidebarNav.close();
    expect(SidebarNav.isOpen()).toBe(false);
    expect(document.body.classList.contains('sidebar-open')).toBe(false);
    expect(document.getElementById('sidebarToggle').getAttribute('aria-expanded')).toBe('false');
    expect(document.getElementById('sidebarOverlay').hidden).toBe(true);
  });

  it('toggle() alternates state', () => {
    expect(SidebarNav.isOpen()).toBe(false);
    SidebarNav.toggle();
    expect(SidebarNav.isOpen()).toBe(true);
    SidebarNav.toggle();
    expect(SidebarNav.isOpen()).toBe(false);
  });

  it('clicking the overlay closes the sidebar', () => {
    SidebarNav.open();
    document.getElementById('sidebarOverlay').dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(SidebarNav.isOpen()).toBe(false);
  });

  it('Escape closes the sidebar when open', () => {
    SidebarNav.open();
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    expect(SidebarNav.isOpen()).toBe(false);
  });

  it('returns focus to the toggle button on close', () => {
    const toggleBtn = document.getElementById('sidebarToggle');
    SidebarNav.open();
    SidebarNav.close();
    expect(document.activeElement).toBe(toggleBtn);
  });

  it('the menu button click toggles the sidebar', () => {
    const toggleBtn = document.getElementById('sidebarToggle');
    toggleBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    expect(SidebarNav.isOpen()).toBe(true);
  });
});
