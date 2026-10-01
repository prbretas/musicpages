/**
 * Unit tests: SidebarNav nav item behavior.
 * - Anchor item: scrolls to section (via HeaderNav.scrollToSection) and closes.
 * - data-popup item: does NOT scroll, closes, and keeps the data-popup attribute.
 * Requirements: 2.2, 2.3, 2.4, 1.7
 */

describe('SidebarNav nav items', () => {
  let SidebarNav;
  let scrollSpy;

  beforeEach(() => {
    jest_resetModules();

    document.body.innerHTML = `
      <button id="sidebarToggle" aria-expanded="false"></button>
      <div id="sidebarOverlay" hidden></div>
      <nav id="appSidebar" class="app-sidebar">
        <button class="sidebar-close"></button>
        <ul class="sidebar-links">
          <li><a id="anchorItem" href="#fretboardContainer">Braço</a></li>
          <li><a id="popupItem" href="#metronomeContainer" data-popup="metronome">Metrônomo</a></li>
        </ul>
      </nav>
      <select id="tonica"><option value="C" selected>C</option></select>
      <select id="tipoEscala"><option value="maior" selected>Maior</option></select>
      <select id="topbarTonica"></select>
      <select id="topbarEscala"></select>
      <div id="fretboardContainer"></div>
      <div id="metronomeContainer"></div>
    `;

    // Provide a global HeaderNav with a spy on scrollToSection.
    scrollSpy = [];
    global.HeaderNav = {
      scrollToSection: function (id) { scrollSpy.push(id); }
    };
    global.window.HeaderNav = global.HeaderNav;

    SidebarNav = require('../../../scripts/script-sidebar.js');
    SidebarNav.init();
  });

  afterEach(() => {
    if (SidebarNav && SidebarNav.isOpen()) SidebarNav.close();
    document.body.innerHTML = '';
    document.body.className = '';
    delete global.HeaderNav;
    if (global.window) delete global.window.HeaderNav;
  });

  // Minimal module cache reset for CommonJS so each test re-runs the IIFE.
  function jest_resetModules() {
    const path = require.resolve('../../../scripts/script-sidebar.js');
    delete require.cache[path];
  }

  it('anchor item calls scrollToSection and closes the sidebar', () => {
    SidebarNav.open();
    const anchor = document.getElementById('anchorItem');
    anchor.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));

    expect(scrollSpy).toContain('fretboardContainer');
    expect(SidebarNav.isOpen()).toBe(false);
  });

  it('data-popup item does NOT scroll and closes the sidebar', () => {
    SidebarNav.open();
    const popupItem = document.getElementById('popupItem');
    popupItem.dispatchEvent(new window.Event('click', { bubbles: true, cancelable: true }));

    // No scroll triggered for popup items
    expect(scrollSpy).not.toContain('metronomeContainer');
    expect(SidebarNav.isOpen()).toBe(false);
  });

  it('preserves the data-popup attribute on popup items', () => {
    const popupItem = document.getElementById('popupItem');
    expect(popupItem.getAttribute('data-popup')).toBe('metronome');
  });
});
