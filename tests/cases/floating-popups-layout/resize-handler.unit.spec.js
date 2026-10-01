/**
 * Unit tests for the resize handler with debounce (Task 7.2)
 * Validates: Requirement 1.9
 *
 * Tests that:
 * - On window resize, open popups are re-clamped to stay within viewport
 * - The resize handler is debounced (100ms)
 * - Closed popups are not affected
 */

describe('Resize handler with debounce (Req 1.9)', () => {
  let FloatingPopup;

  beforeEach(() => {
    // Set initial viewport dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true, configurable: true });

    // Use fake timers BEFORE loading module so the resize setTimeout is intercepted
    vi.useFakeTimers();

    // Reset module cache to get a fresh load with DOMContentLoaded
    vi.resetModules();

    // Simulate DOMContentLoaded not having fired yet
    Object.defineProperty(document, 'readyState', { value: 'loading', writable: true, configurable: true });

    // Load the module — this registers the DOMContentLoaded listener
    FloatingPopup = require('../../../scripts/script-floating-popup.js');

    // Now fire DOMContentLoaded to trigger the listener (including resize handler registration)
    Object.defineProperty(document, 'readyState', { value: 'complete', writable: true, configurable: true });
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    // Destroy any created popups
    var instances = FloatingPopup.getInstances();
    for (var key in instances) {
      if (instances.hasOwnProperty(key)) {
        instances[key].destroy();
      }
    }
    vi.useRealTimers();
  });

  it('should re-clamp open popup position when viewport shrinks', () => {
    // Create and open a popup
    var popup = FloatingPopup.create({
      id: 'resize-test-popup',
      title: 'Resize Test',
      contentSelector: null,
      size: { width: '300px', height: '200px' }
    });

    popup.open();

    var el = popup.getElement();

    // Position popup near the right edge of the original viewport
    el.style.left = '900px';
    el.style.top = '600px';

    // Mock offsetWidth/offsetHeight
    Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { value: 200, configurable: true });

    // Simulate viewport shrink
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true, configurable: true });

    // Fire resize event
    window.dispatchEvent(new Event('resize'));

    // Before debounce completes, position should be unchanged
    expect(el.style.left).toBe('900px');
    expect(el.style.top).toBe('600px');

    // Advance timers past debounce (100ms)
    vi.advanceTimersByTime(100);

    // After debounce, position should be clamped
    // Right constraint: x <= viewport.width - minVisible = 500 - 32 = 468
    // Bottom constraint: y <= viewport.height - minVisible = 400 - 32 = 368
    expect(parseInt(el.style.left, 10)).toBeLessThanOrEqual(468);
    expect(parseInt(el.style.top, 10)).toBeLessThanOrEqual(368);
  });

  it('should not affect closed popups on resize', () => {
    // Create a popup but keep it closed
    var popup = FloatingPopup.create({
      id: 'resize-closed-test',
      title: 'Closed Test',
      contentSelector: null,
      size: { width: '300px', height: '200px' }
    });

    var el = popup.getElement();
    el.style.left = '900px';
    el.style.top = '600px';

    // Simulate viewport shrink
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true, configurable: true });

    // Fire resize event and advance timers
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(100);

    // Position should remain unchanged (popup is closed)
    expect(el.style.left).toBe('900px');
    expect(el.style.top).toBe('600px');
  });

  it('should debounce multiple rapid resize events (100ms)', () => {
    var popup = FloatingPopup.create({
      id: 'resize-debounce-test',
      title: 'Debounce Test',
      contentSelector: null,
      size: { width: '300px', height: '200px' }
    });

    popup.open();

    var el = popup.getElement();
    el.style.left = '900px';
    el.style.top = '500px';

    Object.defineProperty(el, 'offsetWidth', { value: 300, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { value: 200, configurable: true });

    // Fire multiple resize events rapidly
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true });
    window.dispatchEvent(new Event('resize'));

    vi.advanceTimersByTime(50); // Only 50ms passed

    Object.defineProperty(window, 'innerWidth', { value: 600, writable: true, configurable: true });
    window.dispatchEvent(new Event('resize'));

    vi.advanceTimersByTime(50); // 50ms more since second event

    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true, configurable: true });
    window.dispatchEvent(new Event('resize'));

    // Now advance 100ms from last event
    vi.advanceTimersByTime(100);

    // Should use the final viewport width (400)
    // Right constraint: x <= 400 - 32 = 368
    expect(parseInt(el.style.left, 10)).toBeLessThanOrEqual(368);
  });
});
