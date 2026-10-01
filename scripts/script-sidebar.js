// ************ Sidebar Navigation + Topbar Scale Selectors *****************
/**
 * SidebarNav IIFE
 * Off-canvas retractable sidebar navigation + topbar tonic/scale selectors.
 *
 * - Sidebar: opens/closes via the topbar menu button, overlay click, Escape,
 *   the internal close button, or clicking any nav item. Uses a focus trap
 *   (reused from FloatingPopup when available) and returns focus to the menu
 *   button on close.
 * - Nav items: anchor links scroll to their section (via HeaderNav.scrollToSection);
 *   `data-popup` items let the existing FloatingPopup wiring open the popup
 *   (we don't scroll for those). In both cases the sidebar closes afterwards.
 * - Topbar selectors mirror #tonica / #tipoEscala (options cloned for parity),
 *   kept in sync both ways; changing them triggers calcularEscala().
 *
 * Requirements: 1.*, 2.*, 3.*, 4.*, 5.*, 6.*, 7.*
 */

/* global document, window, HeaderNav, calcularEscala */

var SidebarNav = (function () {
  'use strict';

  var sidebarEl = null;
  var overlayEl = null;
  var menuBtn = null;
  var closeBtn = null;
  var focusTrap = null;
  var keydownHandler = null;
  var isOpen = false;
  var _initialized = false;

  // Guard against sync feedback loops between topbar and original selects.
  var _syncing = false;

  // -----------------------------------------------------------------
  // Focus trap: reuse FloatingPopup's tested implementation when present,
  // otherwise fall back to a minimal local trap.
  // -----------------------------------------------------------------
  function makeFocusTrap(container) {
    if (typeof window !== 'undefined' &&
        window._FloatingPopupInternals &&
        typeof window._FloatingPopupInternals.createFocusTrap === 'function') {
      return window._FloatingPopupInternals.createFocusTrap(container);
    }
    // Minimal fallback
    var handler = null;
    function getFocusable() {
      var sel = 'a[href], button:not(:disabled), input:not(:disabled), ' +
        'select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
      return Array.prototype.slice.call(container.querySelectorAll(sel))
        .filter(function (el) { return el.offsetParent !== null; });
    }
    return {
      activate: function () {
        if (handler) return;
        handler = function (e) {
          if (e.key !== 'Tab') return;
          var f = getFocusable();
          if (!f.length) { e.preventDefault(); return; }
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        };
        container.addEventListener('keydown', handler);
      },
      deactivate: function () {
        if (handler) { container.removeEventListener('keydown', handler); handler = null; }
      }
    };
  }

  // -----------------------------------------------------------------
  // Sidebar lifecycle
  // -----------------------------------------------------------------
  function open() {
    if (isOpen || !sidebarEl) return;
    isOpen = true;

    menuBtn && menuBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sidebar-open');
    if (overlayEl) overlayEl.hidden = false;

    if (focusTrap) focusTrap.activate();

    // Move focus into the sidebar (close button first).
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
    }

    document.addEventListener('keydown', keydownHandler);
  }

  function close() {
    if (!isOpen || !sidebarEl) return;
    isOpen = false;

    menuBtn && menuBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sidebar-open');
    if (overlayEl) overlayEl.hidden = true;

    if (focusTrap) focusTrap.deactivate();
    document.removeEventListener('keydown', keydownHandler);

    // Return focus to the toggle that opened the sidebar.
    if (menuBtn && typeof menuBtn.focus === 'function') {
      menuBtn.focus();
    }
  }

  function toggle() {
    if (isOpen) close();
    else open();
  }

  // -----------------------------------------------------------------
  // Nav item wiring
  // -----------------------------------------------------------------
  function handleItemClick(event) {
    var link = event.currentTarget;
    var popup = link.getAttribute('data-popup');
    var href = link.getAttribute('href');

    if (popup) {
      // Let the existing FloatingPopup listener handle opening the popup.
      // Do NOT scroll; just close the sidebar.
      close();
      return;
    }

    // Anchor link: smooth-scroll to the section, then close.
    event.preventDefault();
    var sectionId = href && href.charAt(0) === '#' ? href.substring(1) : null;
    if (sectionId) {
      if (typeof HeaderNav !== 'undefined' &&
          HeaderNav && typeof HeaderNav.scrollToSection === 'function') {
        HeaderNav.scrollToSection(sectionId);
      } else {
        var el = document.getElementById(sectionId);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    close();
  }

  // -----------------------------------------------------------------
  // Topbar selectors (mirror #tonica / #tipoEscala)
  // -----------------------------------------------------------------
  function cloneOptions(sourceSelect, targetSelect) {
    if (!sourceSelect || !targetSelect) return;
    // Deep-clone children (options and optgroups) for exact parity.
    targetSelect.innerHTML = '';
    for (var i = 0; i < sourceSelect.children.length; i++) {
      targetSelect.appendChild(sourceSelect.children[i].cloneNode(true));
    }
    targetSelect.value = sourceSelect.value;
  }

  // Stable references so sync can be wired idempotently (remove-then-add).
  var _selEls = null;

  function _resolveCalcularEscala() {
    if (typeof calcularEscala === 'function') return calcularEscala;
    if (typeof window !== 'undefined' && typeof window.calcularEscala === 'function') {
      return window.calcularEscala;
    }
    return null;
  }

  function onTonicaTopbarChange() {
    if (_syncing || !_selEls) return;
    _syncing = true;
    try {
      _selEls.tonicaOrig.value = _selEls.tonicaTop.value;
      var fn = _resolveCalcularEscala();
      if (fn) fn();
    } finally {
      _syncing = false;
    }
  }

  function onEscalaTopbarChange() {
    if (_syncing || !_selEls) return;
    _syncing = true;
    try {
      _selEls.escalaOrig.value = _selEls.escalaTop.value;
      var fn = _resolveCalcularEscala();
      if (fn) fn();
    } finally {
      _syncing = false;
    }
  }

  function reflectToTopbar() {
    if (_syncing || !_selEls) return;
    _syncing = true;
    try {
      if (_selEls.tonicaTop.value !== _selEls.tonicaOrig.value) {
        _selEls.tonicaTop.value = _selEls.tonicaOrig.value;
      }
      if (_selEls.escalaTop.value !== _selEls.escalaOrig.value) {
        _selEls.escalaTop.value = _selEls.escalaOrig.value;
      }
    } finally {
      _syncing = false;
    }
  }

  function setupSelectorSync() {
    var tonicaOrig = document.getElementById('tonica');
    var escalaOrig = document.getElementById('tipoEscala');
    var tonicaTop = document.getElementById('topbarTonica');
    var escalaTop = document.getElementById('topbarEscala');

    if (!tonicaOrig || !escalaOrig || !tonicaTop || !escalaTop) return;

    _selEls = {
      tonicaOrig: tonicaOrig, escalaOrig: escalaOrig,
      tonicaTop: tonicaTop, escalaTop: escalaTop
    };

    cloneOptions(tonicaOrig, tonicaTop);
    cloneOptions(escalaOrig, escalaTop);

    // Remove-then-add keeps this idempotent across re-inits (and tests).
    tonicaTop.removeEventListener('change', onTonicaTopbarChange);
    tonicaTop.addEventListener('change', onTonicaTopbarChange);
    escalaTop.removeEventListener('change', onEscalaTopbarChange);
    escalaTop.addEventListener('change', onEscalaTopbarChange);

    tonicaOrig.removeEventListener('change', reflectToTopbar);
    tonicaOrig.addEventListener('change', reflectToTopbar);
    escalaOrig.removeEventListener('change', reflectToTopbar);
    escalaOrig.addEventListener('change', reflectToTopbar);

    document.removeEventListener('scale-changed', reflectToTopbar);
    document.addEventListener('scale-changed', reflectToTopbar);
  }

  // -----------------------------------------------------------------
  // Init
  // -----------------------------------------------------------------
  function init() {
    sidebarEl = document.getElementById('appSidebar');
    overlayEl = document.getElementById('sidebarOverlay');
    menuBtn = document.getElementById('sidebarToggle');
    closeBtn = sidebarEl ? sidebarEl.querySelector('.sidebar-close') : null;

    keydownHandler = function (e) {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (sidebarEl) {
      focusTrap = makeFocusTrap(sidebarEl);

      // Nav items (remove-then-add keeps init idempotent across re-inits/tests)
      var links = sidebarEl.querySelectorAll('.sidebar-links a');
      for (var i = 0; i < links.length; i++) {
        links[i].removeEventListener('click', handleItemClick);
        links[i].addEventListener('click', handleItemClick);
      }
    }

    if (menuBtn) {
      menuBtn.removeEventListener('click', toggle);
      menuBtn.addEventListener('click', toggle);
    }
    if (closeBtn) {
      closeBtn.removeEventListener('click', close);
      closeBtn.addEventListener('click', close);
    }
    if (overlayEl) {
      overlayEl.removeEventListener('click', close);
      overlayEl.addEventListener('click', close);
    }

    setupSelectorSync();
    _initialized = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // -----------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------
  return {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
    isOpen: function () { return isOpen; }
  };
})();

// Conditional export for Vitest testability
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SidebarNav;
}
