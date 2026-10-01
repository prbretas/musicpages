/**
 * Quick verification test for FloatingPopup.create (task 5.1)
 */
const { create, getInstances } = require('../../../scripts/script-floating-popup.js');

describe('FloatingPopup.create', () => {
  let popup;

  beforeEach(() => {
    // Setup DOM content element
    const contentDiv = document.createElement('div');
    contentDiv.id = 'test-content';
    contentDiv.textContent = 'Hello World';
    document.body.appendChild(contentDiv);
  });

  afterEach(() => {
    // Cleanup
    if (popup && typeof popup.destroy === 'function') {
      popup.destroy();
    }
    // Clean any remaining popups
    const instances = getInstances();
    Object.keys(instances).forEach(key => {
      instances[key].destroy();
    });
    document.body.className = '';
  });

  it('creates a popup element with correct DOM structure', () => {
    popup = create({
      id: 'test-popup',
      title: 'Test Popup',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    const el = popup.getElement();
    expect(el).toBeTruthy();
    expect(el.id).toBe('test-popup');
    expect(el.className).toBe('floating-popup');

    // Header structure
    const header = el.querySelector('.popup-header');
    expect(header).toBeTruthy();

    const title = el.querySelector('.popup-title');
    expect(title.textContent).toBe('Test Popup');

    const closeBtn = el.querySelector('.popup-close-btn');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Fechar');

    // Body with moved content
    const body = el.querySelector('.popup-body');
    expect(body).toBeTruthy();
    expect(body.querySelector('#test-content')).toBeTruthy();
  });

  it('sets correct ARIA attributes', () => {
    popup = create({
      id: 'aria-popup',
      title: 'ARIA Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    const el = popup.getElement();
    expect(el.getAttribute('role')).toBe('dialog');
    expect(el.getAttribute('aria-label')).toBe('ARIA Test');
    expect(el.getAttribute('aria-modal')).toBe('true');
  });

  it('starts hidden (display: none)', () => {
    popup = create({
      id: 'hidden-popup',
      title: 'Hidden',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    expect(popup.isOpen()).toBe(false);
    expect(popup.getElement().style.display).toBe('none');
  });

  it('has position: fixed and correct size', () => {
    popup = create({
      id: 'size-popup',
      title: 'Size Test',
      contentSelector: '#test-content',
      size: { width: '500px', height: '400px' }
    });

    const el = popup.getElement();
    expect(el.style.position).toBe('fixed');
    expect(el.style.width).toBe('500px');
    expect(el.style.height).toBe('400px');
  });

  it('open() shows popup and applies scroll lock', () => {
    popup = create({
      id: 'open-popup',
      title: 'Open Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.open();
    expect(popup.isOpen()).toBe(true);
    expect(popup.getElement().style.display).not.toBe('none');
    expect(document.body.classList.contains('popup-open')).toBe(true);
  });

  it('close() hides popup and removes scroll lock', () => {
    popup = create({
      id: 'close-popup',
      title: 'Close Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.open();
    popup.close();
    expect(popup.isOpen()).toBe(false);
    expect(popup.getElement().style.display).toBe('none');
    expect(document.body.classList.contains('popup-open')).toBe(false);
  });

  it('close() returns focus to trigger element', () => {
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'trigger-btn';
    document.body.appendChild(triggerBtn);
    triggerBtn.focus();

    popup = create({
      id: 'focus-popup',
      title: 'Focus Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.open();
    popup.close();
    expect(document.activeElement).toBe(triggerBtn);

    document.body.removeChild(triggerBtn);
  });

  it('toggle() alternates between open and close', () => {
    popup = create({
      id: 'toggle-popup',
      title: 'Toggle Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.toggle();
    expect(popup.isOpen()).toBe(true);

    popup.toggle();
    expect(popup.isOpen()).toBe(false);
  });

  it('implements singleton by ID', () => {
    popup = create({
      id: 'singleton-popup',
      title: 'First',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    const popup2 = create({
      id: 'singleton-popup',
      title: 'Second',
      contentSelector: '#test-content',
      size: { width: '600px', height: '500px' }
    });

    expect(popup).toBe(popup2);
  });

  it('destroy() removes from DOM and singleton registry', () => {
    popup = create({
      id: 'destroy-popup',
      title: 'Destroy Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.destroy();
    expect(document.querySelector('#destroy-popup')).toBeNull();
    expect(getInstances()['destroy-popup']).toBeUndefined();
    popup = null; // Already destroyed
  });

  it('Escape key closes popup', () => {
    popup = create({
      id: 'escape-popup',
      title: 'Escape Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.open();
    expect(popup.isOpen()).toBe(true);

    // Simulate Escape keydown
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(event);

    expect(popup.isOpen()).toBe(false);
  });

  it('invokes onOpen and onClose callbacks', () => {
    let openCalled = false;
    let closeCalled = false;

    popup = create({
      id: 'callback-popup',
      title: 'Callback Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' },
      onOpen: () => { openCalled = true; },
      onClose: () => { closeCalled = true; }
    });

    popup.open();
    expect(openCalled).toBe(true);

    popup.close();
    expect(closeCalled).toBe(true);
  });

  it('close button click closes the popup', () => {
    popup = create({
      id: 'closebtn-popup',
      title: 'Close Btn Test',
      contentSelector: '#test-content',
      size: { width: '400px', height: '300px' }
    });

    popup.open();
    expect(popup.isOpen()).toBe(true);

    const closeBtn = popup.getElement().querySelector('.popup-close-btn');
    closeBtn.click();

    expect(popup.isOpen()).toBe(false);
  });
});
