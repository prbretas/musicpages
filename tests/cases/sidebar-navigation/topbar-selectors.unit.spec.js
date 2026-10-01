/**
 * Unit tests: topbar tonic/scale selectors mirroring the originals.
 * Requirements: 4.1, 4.2, 4.3 — Correctness Properties P1 (option parity), P2 (no sync loop).
 */

describe('Topbar scale selectors', () => {
  let SidebarNav;
  let calcCalls;

  function jestResetModules() {
    const path = require.resolve('../../../scripts/script-sidebar.js');
    delete require.cache[path];
  }

  beforeEach(() => {
    jestResetModules();

    document.body.innerHTML = `
      <button id="sidebarToggle"></button>
      <div id="sidebarOverlay" hidden></div>
      <nav id="appSidebar"><ul class="sidebar-links"></ul></nav>

      <select id="tonica">
        <option value="C" selected>C</option>
        <option value="C#">C# / Db</option>
        <option value="D">D</option>
      </select>
      <select id="tipoEscala">
        <optgroup label="Diatônicas">
          <option value="maior" selected>Maior (Jônio)</option>
          <option value="menor_natural">Menor Natural</option>
        </optgroup>
        <optgroup label="Modos">
          <option value="dorico">Dórico</option>
        </optgroup>
      </select>
      <select id="topbarTonica"></select>
      <select id="topbarEscala"></select>
    `;

    // Spy on the global calcularEscala used by the module.
    calcCalls = 0;
    global.calcularEscala = function () { calcCalls += 1; };
    global.window.calcularEscala = global.calcularEscala;

    SidebarNav = require('../../../scripts/script-sidebar.js');
    SidebarNav.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete global.calcularEscala;
    if (global.window) delete global.window.calcularEscala;
  });

  function optionSignature(select) {
    return Array.prototype.map.call(
      select.querySelectorAll('option'),
      function (o) { return o.value + '::' + o.textContent.trim(); }
    );
  }

  it('P1: topbar options match the original selects exactly', () => {
    expect(optionSignature(document.getElementById('topbarTonica')))
      .toEqual(optionSignature(document.getElementById('tonica')));
    expect(optionSignature(document.getElementById('topbarEscala')))
      .toEqual(optionSignature(document.getElementById('tipoEscala')));
  });

  it('preserves optgroup structure when cloning the scale select', () => {
    const groups = document.getElementById('topbarEscala').querySelectorAll('optgroup');
    expect(groups.length).toBe(2);
  });

  it('initial topbar values equal the originals', () => {
    expect(document.getElementById('topbarTonica').value).toBe('C');
    expect(document.getElementById('topbarEscala').value).toBe('maior');
  });

  it('changing the topbar copies the value to the original and calls calcularEscala once', () => {
    const topTonica = document.getElementById('topbarTonica');
    topTonica.value = 'D';
    topTonica.dispatchEvent(new window.Event('change', { bubbles: true }));

    expect(document.getElementById('tonica').value).toBe('D');
    expect(calcCalls).toBe(1);
  });

  it('P2: syncing does not cause a feedback loop (single calc call)', () => {
    const topEscala = document.getElementById('topbarEscala');
    topEscala.value = 'dorico';
    topEscala.dispatchEvent(new window.Event('change', { bubbles: true }));

    // Original updated, topbar unchanged, and exactly one recalculation.
    expect(document.getElementById('tipoEscala').value).toBe('dorico');
    expect(topEscala.value).toBe('dorico');
    expect(calcCalls).toBe(1);
  });

  it('reflects external changes (scale-changed) back onto the topbar without re-calc', () => {
    // Simulate external code changing the originals then dispatching scale-changed.
    document.getElementById('tonica').value = 'C#';
    document.getElementById('tipoEscala').value = 'menor_natural';
    document.dispatchEvent(new window.CustomEvent('scale-changed', {
      detail: { tonica: 'C#', tipoEscala: 'menor_natural' }
    }));

    expect(document.getElementById('topbarTonica').value).toBe('C#');
    expect(document.getElementById('topbarEscala').value).toBe('menor_natural');
    // Reflecting external state must not trigger calcularEscala.
    expect(calcCalls).toBe(0);
  });
});
