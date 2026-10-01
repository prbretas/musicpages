/**
 * script-floating-popup.js
 * FloatingPopup IIFE — Generic floating popup system with drag-and-drop,
 * z-index stacking, viewport clamping, focus trap, and responsive support.
 *
 * Requirements: 1.1–1.9, 2.1–2.7, 3.1–3.7, 4.1–4.4, 5.1–5.4, 6.1–6.7, 7.1–7.5
 */

/* global document, window */

var FloatingPopup = (function () {
  'use strict';

  // ---------------------------------------------------------------
  // DragManager — Pure Functions
  // ---------------------------------------------------------------

  /**
   * Computes the new popup position based on the pointer movement delta.
   * Pure function, testable in isolation.
   *
   * @param {Object} initialPos - { x, y } initial popup position when drag started
   * @param {Object} startPointer - { x, y } pointer position when drag started
   * @param {Object} currentPointer - { x, y } current pointer position
   * @returns {Object} { x, y } new popup position
   */
  function computeDragPosition(initialPos, startPointer, currentPointer) {
    return {
      x: initialPos.x + (currentPointer.x - startPointer.x),
      y: initialPos.y + (currentPointer.y - startPointer.y)
    };
  }

  /**
   * Clamps the popup position to keep at least `minVisible` pixels of the
   * drag area (header) visible within the viewport boundaries.
   * Pure function, testable in isolation.
   *
   * Constraints enforced:
   *   - clampedX + popupSize.width >= minVisible  (left edge: at least minVisible px of width visible)
   *   - clampedX <= viewport.width - minVisible   (right edge: popup left doesn't go too far right)
   *   - clampedY >= 0                             (top edge: header stays below top)
   *   - clampedY <= viewport.height - minVisible  (bottom edge: at least minVisible px of header visible)
   *
   * @param {Object} position - { x, y } desired position (top-left corner)
   * @param {Object} popupSize - { width, height } popup dimensions
   * @param {Object} viewport - { width, height } viewport dimensions
   * @param {number} minVisible - minimum pixels of drag area that must remain visible (default: 32)
   * @returns {Object} { x, y } clamped position
   */
  function clampPosition(position, popupSize, viewport, minVisible) {
    if (minVisible === undefined || minVisible === null) {
      minVisible = 32;
    }

    var x = position.x;
    var y = position.y;

    // Left constraint: x + popupSize.width >= minVisible
    // => x >= minVisible - popupSize.width
    var minX = minVisible - popupSize.width;
    if (x < minX) {
      x = minX;
    }

    // Right constraint: x <= viewport.width - minVisible
    var maxX = viewport.width - minVisible;
    if (x > maxX) {
      x = maxX;
    }

    // Top constraint: y >= 0
    if (y < 0) {
      y = 0;
    }

    // Bottom constraint: y <= viewport.height - minVisible
    var maxY = viewport.height - minVisible;
    if (y > maxY) {
      y = maxY;
    }

    return { x: x, y: y };
  }

  // ---------------------------------------------------------------
  // ZIndexManager — Manages z-index stacking across multiple popups
  // ---------------------------------------------------------------

  /**
   * Manages z-index values for multiple popup instances.
   * Ensures the last-focused popup is always visually on top.
   *
   * Requirements: 1.1 (z-index mínimo 1000), 1.8 (bring to front on click/drag),
   *               4.3 (bring to focus without new instance)
   */
  var ZIndexManager = {
    BASE_Z: 1000,
    current: 1000,

    /**
     * Brings the given popup element to the front by assigning
     * the next highest z-index value.
     * @param {HTMLElement} popupElement - The popup DOM element to bring to front
     */
    bringToFront: function (popupElement) {
      this.current += 1;
      popupElement.style.zIndex = this.current;
    },

    /**
     * Returns the current highest z-index value.
     * @returns {number} The highest z-index currently assigned
     */
    getHighest: function () {
      return this.current;
    }
  };

  // ---------------------------------------------------------------
  // ScaleHighlighter — Manages row highlighting in the scale
  // structure table based on the currently selected scale.
  // ---------------------------------------------------------------

  /**
   * Highlights the row in the scale structure table that matches
   * the given tipoEscala. Uses text matching on the first cell
   * (scale name) to find the correct row.
   *
   * Requirements:
   *   3.3 — highlight row matching selected scale
   *   3.4 — remove previous highlight when scale changes
   *   5.1 — update highlight on scale-changed event
   *   5.3 — store value when popup is closed, apply on open
   *   5.4 — clear highlight if tipoEscala doesn't match any row
   */
  var ScaleHighlighter = {
    currentScale: null,

    /**
     * Formats a scale key into the display name used in the table.
     * Mirrors the formatarNome logic from script-escalas.js:
     *   "menor_natural" → "Menor Natural"
     * @param {string} chave - The scale key (e.g., "maior", "menor_natural")
     * @returns {string} The formatted display name
     */
    _formatarNome: function (chave) {
      return chave
        .split('_')
        .map(function (word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
    },

    /**
     * Highlights the table row corresponding to the given scale type.
     * 1. Clears any existing highlight
     * 2. Stores the tipoEscala value in currentScale
     * 3. Finds the row whose first cell text matches the formatted tipoEscala
     * 4. Applies 'highlight-row' class to that row
     *
     * If tipoEscala is null/undefined or doesn't match any row,
     * only clears without applying new highlight (Req 5.4).
     *
     * @param {string} tipoEscala - Scale key (e.g., "maior", "menor_natural")
     */
    highlight: function (tipoEscala) {
      this.clear();
      this.currentScale = tipoEscala;

      if (!tipoEscala) {
        return;
      }

      var tableContainer = typeof document !== 'undefined'
        ? document.getElementById('tabelaGeralEscalasResultado')
        : null;

      if (!tableContainer) {
        return;
      }

      var rows = tableContainer.querySelectorAll('tr');
      var formattedName = this._formatarNome(tipoEscala);

      for (var i = 0; i < rows.length; i++) {
        var firstCell = rows[i].querySelector('td');
        if (firstCell) {
          var cellText = firstCell.textContent.trim();
          if (cellText === formattedName || cellText.indexOf(formattedName) !== -1) {
            rows[i].classList.add('highlight-row');
            break;
          }
        }
      }
    },

    /**
     * Removes the highlight class from all rows in the scale table.
     */
    clear: function () {
      var tableContainer = typeof document !== 'undefined'
        ? document.getElementById('tabelaGeralEscalasResultado')
        : null;

      if (!tableContainer) {
        return;
      }

      var highlightedRows = tableContainer.querySelectorAll('.highlight-row');
      for (var i = 0; i < highlightedRows.length; i++) {
        highlightedRows[i].classList.remove('highlight-row');
      }
    }
  };

  // ---------------------------------------------------------------
  // FocusTrap — Manages focus cycling within a popup container
  // ---------------------------------------------------------------

  /**
   * Returns all focusable elements inside a container, filtered to only
   * include visible, non-disabled elements in DOM order.
   *
   * Selectors: a[href], button:not(:disabled), input:not(:disabled),
   *            select:not(:disabled), textarea:not(:disabled),
   *            [tabindex]:not([tabindex="-1"])
   *
   * Visibility: excludes elements with offsetParent === null (handles
   * display:none and visibility:hidden ancestors) or inline display:none.
   *
   * Requirements: 6.3
   *
   * @param {HTMLElement} container - The container to search within
   * @returns {HTMLElement[]} Array of focusable elements in DOM order
   */
  function getFocusableElements(container) {
    var selector = 'a[href], button:not(:disabled), input:not(:disabled), ' +
      'select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

    var candidates = container.querySelectorAll(selector);
    var focusable = [];

    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      // Filter out hidden elements: offsetParent is null for display:none
      // or elements within a display:none ancestor (except fixed positioned).
      // Also check computed display directly for edge cases.
      var isHidden = el.offsetParent === null;
      if (!isHidden) {
        focusable.push(el);
      } else {
        // offsetParent is null for fixed-position elements too,
        // so check getComputedStyle if available
        if (typeof window !== 'undefined' && window.getComputedStyle) {
          var style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden') {
            focusable.push(el);
          }
        }
      }
    }

    return focusable;
  }

  /**
   * Creates a focus trap for a given container element.
   * When activated, intercepts Tab and Shift+Tab keydown events to cycle
   * focus within the container's focusable elements.
   *
   * Requirements: 6.3, 6.4
   *
   * @param {HTMLElement} container - The container element to trap focus within
   * @returns {{ activate: Function, deactivate: Function }}
   */
  function createFocusTrap(container) {
    var trapHandler = null;

    function handleKeyDown(e) {
      if (e.key !== 'Tab') {
        return;
      }

      var focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      var firstElement = focusableElements[0];
      var lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: if on first element, wrap to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if on last element, wrap to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    return {
      /**
       * Activates the focus trap by adding a keydown listener on the container.
       */
      activate: function () {
        if (trapHandler) {
          return; // Already active
        }
        trapHandler = handleKeyDown;
        container.addEventListener('keydown', trapHandler);
      },

      /**
       * Deactivates the focus trap by removing the keydown listener.
       */
      deactivate: function () {
        if (trapHandler) {
          container.removeEventListener('keydown', trapHandler);
          trapHandler = null;
        }
      }
    };
  }

  // ---------------------------------------------------------------
  // Mobile Detection — matchMedia for bottom sheet mode
  // Requirements: 6.1, 6.2
  // ---------------------------------------------------------------

  /**
   * Detects if the viewport is in mobile mode (< 768px width).
   * Uses matchMedia for efficient detection with change events.
   */
  var mobileQuery = (typeof window !== 'undefined' && window.matchMedia)
    ? window.matchMedia('(max-width: 767px)')
    : null;

  /** Current mobile state flag */
  var _isMobile = mobileQuery ? mobileQuery.matches : false;

  // ---------------------------------------------------------------
  // PopupInstance Factory — FloatingPopup.create(config)
  // ---------------------------------------------------------------

  /** @type {Object.<string, PopupInstance>} Singleton registry keyed by popup ID */
  var instances = {};

  /**
   * Creates (or returns existing) a floating popup instance.
   * Singleton per ID — if config.id already exists, returns the existing instance.
   *
   * @param {Object} config
   * @param {string} config.id - Unique popup ID
   * @param {string} config.title - Title displayed in the header
   * @param {string} config.contentSelector - CSS selector for content to move inside popup
   * @param {string} [config.menuItemSelector] - CSS selector for the menu item that triggers popup
   * @param {Object} [config.size] - { width, height } CSS values
   * @param {Function|null} [config.onOpen] - Callback invoked on open
   * @param {Function|null} [config.onClose] - Callback invoked on close
   * @returns {PopupInstance}
   *
   * Requirements: 1.1, 1.2, 1.6, 1.7, 2.1, 2.3, 2.7, 3.1, 3.5, 3.6, 3.7, 6.4, 6.5, 6.7
   */
  function create(config) {
    // Singleton: return existing instance if ID already registered
    if (instances[config.id]) {
      return instances[config.id];
    }

    var id = config.id;
    var title = config.title || '';
    var contentSelector = config.contentSelector || null;
    var size = config.size || { width: 'auto', height: 'auto' };
    var onOpen = config.onOpen || null;
    var onClose = config.onClose || null;

    var visible = false;
    var triggerElement = null;
    var focusTrap = null;
    var popupElement = null;
    var keydownHandler = null;

    // --- Build DOM ---
    popupElement = document.createElement('div');
    popupElement.className = 'floating-popup';
    popupElement.id = id;
    popupElement.setAttribute('role', 'dialog');
    popupElement.setAttribute('aria-label', title);
    popupElement.setAttribute('aria-modal', 'true');
    popupElement.style.display = 'none';
    popupElement.style.position = 'fixed';
    popupElement.style.zIndex = ZIndexManager.BASE_Z;
    popupElement.style.width = size.width || 'auto';
    popupElement.style.height = size.height || 'auto';

    // Header
    var header = document.createElement('div');
    header.className = 'popup-header';

    var titleSpan = document.createElement('span');
    titleSpan.className = 'popup-title';
    titleSpan.textContent = title;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close-btn';
    closeBtn.setAttribute('aria-label', 'Fechar');
    closeBtn.innerHTML = '&times;';

    header.appendChild(titleSpan);
    header.appendChild(closeBtn);

    // Body
    var body = document.createElement('div');
    body.className = 'popup-body';

    // Move content from contentSelector into popup body
    if (contentSelector) {
      var contentEl = document.querySelector(contentSelector);
      if (contentEl) {
        body.appendChild(contentEl);
      }
    }

    popupElement.appendChild(header);
    popupElement.appendChild(body);
    document.body.appendChild(popupElement);

    // Create focus trap
    focusTrap = createFocusTrap(popupElement);

    // --- Drag-and-drop via Pointer Events ---
    // Requirements: 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5

    // Apply touch-action: none on header to prevent scroll/pull-to-refresh during drag
    header.style.touchAction = 'none';
    header.style.cursor = 'grab';

    var isDragging = false;
    var dragStartPointer = null;  // { x, y } pointer position when drag started
    var dragInitialPos = null;    // { x, y } popup position when drag started
    var activePointerId = null;   // Track the first pointer for multi-touch filtering

    /**
     * List of interactive element tag names that should NOT trigger drag.
     * Requirement 7.5: clicks on buttons, inputs, etc. should not start drag.
     */
    var INTERACTIVE_TAGS = ['BUTTON', 'INPUT', 'SELECT', 'A', 'TEXTAREA'];

    /**
     * Checks if the given target element is an interactive element
     * (or is inside one) that should prevent drag initiation.
     */
    function isInteractiveElement(target) {
      var el = target;
      while (el && el !== header) {
        if (INTERACTIVE_TAGS.indexOf(el.tagName) !== -1) {
          return true;
        }
        el = el.parentElement;
      }
      return false;
    }

    /**
     * Starts the drag operation.
     * Called on pointerdown (or mousedown/touchstart fallback).
     * Aborts if in mobile mode (bottom sheet) — Req 6.1, 6.2
     */
    function startDrag(pointerX, pointerY, pointerId) {
      // Disable drag in mobile bottom sheet mode
      if (_isMobile) {
        return;
      }

      isDragging = true;
      activePointerId = pointerId || null;
      header.style.cursor = 'grabbing';

      // Store initial pointer position
      dragStartPointer = { x: pointerX, y: pointerY };

      // Store initial popup position (from current style or computed)
      var left = parseInt(popupElement.style.left, 10) || 0;
      var top = parseInt(popupElement.style.top, 10) || 0;
      dragInitialPos = { x: left, y: top };

      // Bring popup to front on any pointerdown (Req 1.8)
      ZIndexManager.bringToFront(popupElement);
    }

    /**
     * Moves the popup during drag.
     * Called on pointermove (or mousemove/touchmove fallback).
     */
    function moveDrag(pointerX, pointerY) {
      if (!isDragging) {
        return;
      }

      var currentPointer = { x: pointerX, y: pointerY };
      var newPos = computeDragPosition(dragInitialPos, dragStartPointer, currentPointer);

      // Clamp position to keep drag area visible in viewport
      var rect = popupElement.getBoundingClientRect();
      var popupSize = { width: rect.width, height: rect.height };
      var viewport = {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
      };

      var clamped = clampPosition(newPos, popupSize, viewport, 32);

      // Update popup position
      popupElement.style.left = clamped.x + 'px';
      popupElement.style.top = clamped.y + 'px';
    }

    /**
     * Ends the drag operation.
     * Called on pointerup (or mouseup/touchend fallback).
     */
    function endDrag() {
      isDragging = false;
      activePointerId = null;
      dragStartPointer = null;
      dragInitialPos = null;
      header.style.cursor = 'grab';
    }

    // --- Pointer Events (primary path) ---
    if (typeof window !== 'undefined' && window.PointerEvent) {

      function onPointerDown(e) {
        // Filter: only primary button (left click / first touch)
        if (e.button !== 0) {
          return;
        }

        // Filter: don't start drag on interactive elements (Req 7.5)
        if (isInteractiveElement(e.target)) {
          // Still bring to front on click
          ZIndexManager.bringToFront(popupElement);
          return;
        }

        // Multi-touch: only consider first pointer (Req 7.4)
        if (isDragging) {
          return;
        }

        e.preventDefault();
        header.setPointerCapture(e.pointerId);

        startDrag(e.clientX, e.clientY, e.pointerId);

        // Add move/up listeners on document
        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      }

      function onPointerMove(e) {
        // Only track the pointer that started the drag (Req 7.4)
        if (activePointerId !== null && e.pointerId !== activePointerId) {
          return;
        }
        e.preventDefault();
        moveDrag(e.clientX, e.clientY);
      }

      function onPointerUp(e) {
        // Only respond to the pointer that started the drag
        if (activePointerId !== null && e.pointerId !== activePointerId) {
          return;
        }

        endDrag();

        // Remove move/up listeners from document
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);

        if (header.releasePointerCapture) {
          try { header.releasePointerCapture(e.pointerId); } catch (ex) { /* ignore */ }
        }
      }

      header.addEventListener('pointerdown', onPointerDown);

    } else {
      // --- Fallback: mousedown / touchstart for browsers without PointerEvent ---

      function onMouseDown(e) {
        if (e.button !== 0) {
          return;
        }
        if (isInteractiveElement(e.target)) {
          ZIndexManager.bringToFront(popupElement);
          return;
        }

        e.preventDefault();
        startDrag(e.clientX, e.clientY, null);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }

      function onMouseMove(e) {
        e.preventDefault();
        moveDrag(e.clientX, e.clientY);
      }

      function onMouseUp() {
        endDrag();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      function onTouchStart(e) {
        if (isInteractiveElement(e.target)) {
          ZIndexManager.bringToFront(popupElement);
          return;
        }

        // Only consider first touch (Req 7.4)
        if (e.touches.length > 1) {
          return;
        }

        var touch = e.touches[0];
        e.preventDefault();
        startDrag(touch.clientX, touch.clientY, touch.identifier);

        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
      }

      function onTouchMove(e) {
        // Only track the touch that started the drag
        var touch = null;
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === activePointerId) {
            touch = e.touches[i];
            break;
          }
        }
        if (!touch) {
          return;
        }
        e.preventDefault();
        moveDrag(touch.clientX, touch.clientY);
      }

      function onTouchEnd(e) {
        // Check if our tracked touch ended
        var found = false;
        for (var i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === activePointerId) {
            found = true;
            break;
          }
        }
        if (!found) {
          endDrag();
          document.removeEventListener('touchmove', onTouchMove);
          document.removeEventListener('touchend', onTouchEnd);
        }
      }

      header.addEventListener('mousedown', onMouseDown);
      header.addEventListener('touchstart', onTouchStart, { passive: false });
    }

    // Also bring to front on any click on the popup itself (not just header)
    popupElement.addEventListener('pointerdown', function () {
      ZIndexManager.bringToFront(popupElement);
    });

    // --- Escape key handler ---
    keydownHandler = function (e) {
      if (e.key === 'Escape' && visible) {
        instance.close();
      }
    };

    // --- Close button handler ---
    closeBtn.addEventListener('click', function () {
      instance.close();
    });

    // --- Center popup in viewport ---
    function centerInViewport() {
      var vw = window.innerWidth || document.documentElement.clientWidth;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // Need to measure popup dimensions after display
      var rect = popupElement.getBoundingClientRect();
      var left = Math.max(0, (vw - rect.width) / 2);
      var top = Math.max(0, (vh - rect.height) / 2);
      popupElement.style.left = left + 'px';
      popupElement.style.top = top + 'px';
    }

    // --- Instance methods ---
    var instance = {
      /**
       * Opens the popup: displays it centered, activates focus trap,
       * applies body scroll lock, brings to front.
       * Requirements: 2.1, 3.1, 6.4, 6.5, 6.7
       */
      open: function () {
        if (visible) {
          return;
        }

        // Store the trigger element for focus return
        triggerElement = document.activeElement;

        // Show popup
        popupElement.style.display = '';
        visible = true;

        if (_isMobile) {
          // Mobile bottom sheet mode: CSS handles positioning via media query.
          // Add popup-visible class to trigger slide-up animation (Req 6.1, 6.2)
          // Use requestAnimationFrame to ensure display change is painted before transition starts
          requestAnimationFrame(function () {
            popupElement.classList.add('popup-visible');
          });
        } else {
          // Desktop mode: center in viewport
          centerInViewport();
        }

        // Bring to front via ZIndexManager
        ZIndexManager.bringToFront(popupElement);

        // Body scroll lock
        document.body.classList.add('popup-open');

        // Activate focus trap
        focusTrap.activate();

        // Listen for Escape key
        document.addEventListener('keydown', keydownHandler);

        // Move focus into popup (close button as first interactive element)
        closeBtn.focus();

        // Invoke onOpen callback
        if (typeof onOpen === 'function') {
          onOpen();
        }
      },

      /**
       * Closes the popup: hides it, deactivates focus trap,
       * removes scroll lock, returns focus to trigger element.
       * Requirements: 1.6, 3.6, 6.4
       */
      close: function () {
        if (!visible) {
          return;
        }

        // Remove popup-visible class (for mobile slide-down animation)
        popupElement.classList.remove('popup-visible');

        // Hide popup
        popupElement.style.display = 'none';
        visible = false;

        // Deactivate focus trap
        focusTrap.deactivate();

        // Remove body scroll lock
        document.body.classList.remove('popup-open');

        // Remove Escape listener
        document.removeEventListener('keydown', keydownHandler);

        // Return focus to trigger element
        if (triggerElement && typeof triggerElement.focus === 'function') {
          triggerElement.focus();
        }

        // Invoke onClose callback
        if (typeof onClose === 'function') {
          onClose();
        }
      },

      /**
       * Toggles between open and close state.
       */
      toggle: function () {
        if (visible) {
          instance.close();
        } else {
          instance.open();
        }
      },

      /**
       * Returns whether the popup is currently visible.
       * @returns {boolean}
       */
      isOpen: function () {
        return visible;
      },

      /**
       * Destroys the popup: removes from DOM, cleans up listeners,
       * removes from singleton registry.
       */
      destroy: function () {
        if (visible) {
          instance.close();
        }
        if (popupElement && popupElement.parentNode) {
          popupElement.parentNode.removeChild(popupElement);
        }
        document.removeEventListener('keydown', keydownHandler);
        delete instances[id];
        popupElement = null;
      },

      /**
       * Returns the popup's root DOM element.
       * @returns {HTMLElement}
       */
      getElement: function () {
        return popupElement;
      }
    };

    // Register in singleton map
    instances[id] = instance;

    return instance;
  }

  /**
   * Returns the singleton instances map (for testing purposes).
   * @returns {Object.<string, PopupInstance>}
   */
  function getInstances() {
    return instances;
  }

  // ---------------------------------------------------------------
  // Expose internals for testing
  // ---------------------------------------------------------------
  if (typeof window !== 'undefined') {
    window._FloatingPopupInternals = {
      computeDragPosition: computeDragPosition,
      clampPosition: clampPosition,
      ZIndexManager: ZIndexManager,
      ScaleHighlighter: ScaleHighlighter,
      getFocusableElements: getFocusableElements,
      createFocusTrap: createFocusTrap,
      create: create,
      getInstances: getInstances,
      isMobile: function () { return _isMobile; },
      _setMobile: function (val) { _isMobile = val; },
      _mobileQuery: mobileQuery
    };
  }

  // ---------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------
  return {
    computeDragPosition: computeDragPosition,
    clampPosition: clampPosition,
    ZIndexManager: ZIndexManager,
    ScaleHighlighter: ScaleHighlighter,
    getFocusableElements: getFocusableElements,
    createFocusTrap: createFocusTrap,
    create: create,
    getInstances: getInstances,
    /** @returns {boolean} Whether we're in mobile (bottom sheet) mode */
    isMobile: function () { return _isMobile; },
    /** Sets mobile state — used by matchMedia listener */
    _setMobile: function (val) { _isMobile = val; },
    /** The matchMedia query object (or null if unavailable) */
    _mobileQuery: mobileQuery
  };
})();

// Conditional module.exports for Vitest testability
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    computeDragPosition: FloatingPopup.computeDragPosition,
    clampPosition: FloatingPopup.clampPosition,
    ZIndexManager: FloatingPopup.ZIndexManager,
    ScaleHighlighter: FloatingPopup.ScaleHighlighter,
    getFocusableElements: FloatingPopup.getFocusableElements,
    createFocusTrap: FloatingPopup.createFocusTrap,
    create: FloatingPopup.create,
    getInstances: FloatingPopup.getInstances,
    isMobile: FloatingPopup.isMobile,
    _setMobile: FloatingPopup._setMobile,
    _mobileQuery: FloatingPopup._mobileQuery
  };
}


// ---------------------------------------------------------------
// Popup Instances — Configured after DOM is ready
// ---------------------------------------------------------------

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // --- Metronome Popup Instance (Task 6.1) ---
  // Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
  FloatingPopup.create({
    id: 'metronome-popup',
    title: 'Metrônomo Digital',
    contentSelector: '#metronomeContainer',
    menuItemSelector: '[data-popup="metronome"]',
    size: { width: '380px', height: 'auto' },
    onClose: function () {
      // Check if the metronome is currently playing
      var startStopBtn = document.getElementById('startStopButton');
      var metronomeIsPlaying = startStopBtn &&
        startStopBtn.innerText.indexOf('Parar') !== -1;

      if (metronomeIsPlaying) {
        // Stop the metronome audio via the global function
        if (typeof startStopMetronome === 'function') {
          startStopMetronome();
        }
        // Ensure button text is reset (defensive, in case startStopMetronome didn't reset it)
        if (startStopBtn) {
          startStopBtn.innerText = '▶ Iniciar';
          startStopBtn.style.backgroundColor = '#007bff';
        }
      }
    }
  });

  // --- Scale Structure Popup Instance (Task 6.2) ---
  // Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 5.1, 5.2, 5.3, 5.4

  // Stored tipoEscala value for when popup is closed (Req 5.3)
  var storedTipoEscala = null;

  var scaleStructurePopup = FloatingPopup.create({
    id: 'scale-structure-popup',
    title: '🗺️ Estruturas de Escalas',
    contentSelector: '#scaleStructureSection',
    menuItemSelector: '[data-popup="scale-structure"]',
    size: { width: '600px', height: '500px' },
    onOpen: function () {
      // Apply stored highlight when popup opens (Req 5.3)
      if (storedTipoEscala) {
        FloatingPopup.ScaleHighlighter.highlight(storedTipoEscala);
      } else {
        FloatingPopup.ScaleHighlighter.clear();
      }
    }
  });

  // Listen for scale-changed events (Req 5.1, 5.2, 5.3, 5.4)
  document.addEventListener('scale-changed', function (e) {
    var tipoEscala = e.detail && e.detail.tipoEscala ? e.detail.tipoEscala : null;

    if (scaleStructurePopup.isOpen()) {
      // Popup is open — highlight immediately (Req 5.2)
      if (tipoEscala) {
        FloatingPopup.ScaleHighlighter.highlight(tipoEscala);
      } else {
        // tipoEscala inexistente: clear without error (Req 5.4)
        FloatingPopup.ScaleHighlighter.clear();
      }
    } else {
      // Popup is closed — store the value for later (Req 5.3)
      storedTipoEscala = tipoEscala;
    }
  });

  // ---------------------------------------------------------------
  // Menu Integration (Task 7.1)
  // Requirements: 4.1, 4.2, 4.3, 4.4
  // ---------------------------------------------------------------

  /**
   * Maps data-popup attribute values to their popup instances.
   * Used to connect menu items to the correct popup.
   */
  var popupMap = {
    'metronome': FloatingPopup.getInstances()['metronome-popup'],
    'scale-structure': scaleStructurePopup
  };

  /**
   * Sets up click handler for a menu item that controls a popup.
   * - Click toggles popup open/close
   * - If popup is already open, brings it to front (Req 4.3)
   * - Applies/removes 'active' class on menu item (Req 4.4)
   * - Updates 'active' class when popup is closed via close button or Escape
   *
   * @param {HTMLElement} menuItem - The menu item element with data-popup attribute
   * @param {Object} popupInstance - The popup instance to control
   */
  function setupMenuItemHandler(menuItem, popupInstance) {
    if (!menuItem || !popupInstance) {
      return;
    }

    // Click handler for menu item
    menuItem.addEventListener('click', function (e) {
      e.preventDefault();

      if (popupInstance.isOpen()) {
        // Popup already open: bring to front without creating new instance (Req 4.3)
        FloatingPopup.ZIndexManager.bringToFront(popupInstance.getElement());
      } else {
        // Popup closed: open it
        popupInstance.open();
        menuItem.classList.add('active');
      }
    });

    // Wrap the existing onClose to also update menu item active state.
    // We intercept the popup's close method to remove the active class.
    var originalClose = popupInstance.close;
    popupInstance.close = function () {
      originalClose.call(popupInstance);
      menuItem.classList.remove('active');
    };
  }

  // Register handlers for all menu items with data-popup attributes
  var menuItems = document.querySelectorAll('[data-popup]');
  for (var i = 0; i < menuItems.length; i++) {
    var menuItem = menuItems[i];
    var popupKey = menuItem.getAttribute('data-popup');
    var popupInstance = popupMap[popupKey];

    if (popupInstance) {
      setupMenuItemHandler(menuItem, popupInstance);
    }
  }

  // ---------------------------------------------------------------
  // Resize Handler with Debounce (Task 7.2)
  // Requirement 1.9: Re-clamp popup positions on viewport resize
  // ---------------------------------------------------------------

  var resizeTimer = null;

  window.addEventListener('resize', function () {
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    resizeTimer = setTimeout(function () {
      var allInstances = FloatingPopup.getInstances();
      var viewport = {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
      };

      for (var key in allInstances) {
        if (!allInstances.hasOwnProperty(key)) {
          continue;
        }

        var inst = allInstances[key];

        if (!inst.isOpen()) {
          continue;
        }

        var el = inst.getElement();
        if (!el) {
          continue;
        }

        // Get current position from style
        var currentX = parseInt(el.style.left, 10) || 0;
        var currentY = parseInt(el.style.top, 10) || 0;

        // Get popup dimensions
        var popupWidth = el.offsetWidth;
        var popupHeight = el.offsetHeight;

        // Re-clamp position with 32px minVisible
        var clamped = FloatingPopup.clampPosition(
          { x: currentX, y: currentY },
          { width: popupWidth, height: popupHeight },
          viewport,
          32
        );

        // Apply clamped position
        el.style.left = clamped.x + 'px';
        el.style.top = clamped.y + 'px';
      }
    }, 100);
  });

  // ---------------------------------------------------------------
  // Mobile ↔ Desktop Mode Switch (Task 9.1)
  // Requirements: 6.1, 6.2
  // ---------------------------------------------------------------

  /**
   * Handles the transition between mobile (bottom sheet) and desktop (free drag) modes.
   * When switching from mobile → desktop: restores free position via re-clamp.
   * When switching from desktop → mobile: adds popup-visible class for open popups.
   */
  var mobileQueryRef = FloatingPopup._mobileQuery;

  if (mobileQueryRef) {
    function handleMobileChange(e) {
      FloatingPopup._setMobile(e.matches);

      var allInstances = FloatingPopup.getInstances();

      for (var key in allInstances) {
        if (!allInstances.hasOwnProperty(key)) {
          continue;
        }

        var inst = allInstances[key];
        if (!inst.isOpen()) {
          continue;
        }

        var el = inst.getElement();
        if (!el) {
          continue;
        }

        if (e.matches) {
          // Switching to mobile: add popup-visible class for slide-up display
          el.classList.add('popup-visible');
        } else {
          // Switching to desktop: remove popup-visible class, restore free position
          el.classList.remove('popup-visible');

          // Re-center and re-clamp position for desktop viewport
          var vw = window.innerWidth || document.documentElement.clientWidth;
          var vh = window.innerHeight || document.documentElement.clientHeight;
          var rect = el.getBoundingClientRect();
          var popupWidth = rect.width;
          var popupHeight = rect.height;

          // Center in viewport as initial desktop position
          var left = Math.max(0, (vw - popupWidth) / 2);
          var top = Math.max(0, (vh - popupHeight) / 2);

          // Apply clamp to ensure visibility
          var clamped = FloatingPopup.clampPosition(
            { x: left, y: top },
            { width: popupWidth, height: popupHeight },
            { width: vw, height: vh },
            32
          );

          el.style.left = clamped.x + 'px';
          el.style.top = clamped.y + 'px';
        }
      }
    }

    // Use addEventListener for matchMedia (modern API)
    if (mobileQueryRef.addEventListener) {
      mobileQueryRef.addEventListener('change', handleMobileChange);
    } else if (mobileQueryRef.addListener) {
      // Fallback for older browsers
      mobileQueryRef.addListener(handleMobileChange);
    }
  }
});
