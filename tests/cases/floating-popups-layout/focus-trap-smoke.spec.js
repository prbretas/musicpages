/**
 * Smoke tests for getFocusableElements and createFocusTrap
 * Validates task 3.1 implementation
 */
import { describe, it, expect, beforeEach } from 'vitest'

const {
  getFocusableElements,
  createFocusTrap
} = require('../../../scripts/script-floating-popup.js')

describe('getFocusableElements', () => {
  let container

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('returns buttons, inputs, links, selects, textareas', () => {
    container.innerHTML = `
      <button id="btn1">Click</button>
      <input id="inp1" type="text">
      <a href="#" id="link1">Link</a>
      <select id="sel1"><option>A</option></select>
      <textarea id="ta1"></textarea>
    `
    const elements = getFocusableElements(container)
    expect(elements.length).toBe(5)
  })

  it('excludes disabled elements', () => {
    container.innerHTML = `
      <button id="btn1">Click</button>
      <button id="btn2" disabled>Disabled</button>
      <input id="inp1" disabled>
    `
    const elements = getFocusableElements(container)
    expect(elements.length).toBe(1)
    expect(elements[0].id).toBe('btn1')
  })

  it('includes elements with tabindex (not -1)', () => {
    container.innerHTML = `
      <div tabindex="0" id="div1">Focusable div</div>
      <div tabindex="-1" id="div2">Not focusable</div>
      <span tabindex="1" id="span1">Focusable span</span>
    `
    const elements = getFocusableElements(container)
    expect(elements.length).toBe(2)
    expect(elements.map(e => e.id)).toContain('div1')
    expect(elements.map(e => e.id)).toContain('span1')
  })

  it('returns empty array for container with no focusable elements', () => {
    container.innerHTML = '<div><p>No focusable elements here</p></div>'
    const elements = getFocusableElements(container)
    expect(elements.length).toBe(0)
  })

  it('excludes links without href', () => {
    container.innerHTML = `
      <a href="#" id="link1">Has href</a>
      <a id="link2">No href</a>
    `
    const elements = getFocusableElements(container)
    expect(elements.length).toBe(1)
    expect(elements[0].id).toBe('link1')
  })
})

describe('createFocusTrap', () => {
  let container

  beforeEach(() => {
    document.body.innerHTML = ''
    container = document.createElement('div')
    document.body.appendChild(container)
    container.innerHTML = `
      <button id="first">First</button>
      <button id="middle">Middle</button>
      <button id="last">Last</button>
    `
  })

  it('returns an object with activate and deactivate methods', () => {
    const trap = createFocusTrap(container)
    expect(typeof trap.activate).toBe('function')
    expect(typeof trap.deactivate).toBe('function')
  })

  it('Tab on last element moves focus to first element', () => {
    const trap = createFocusTrap(container)
    trap.activate()

    const lastBtn = container.querySelector('#last')
    const firstBtn = container.querySelector('#first')
    lastBtn.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
      cancelable: true
    })
    container.dispatchEvent(event)

    expect(document.activeElement).toBe(firstBtn)
    trap.deactivate()
  })

  it('Shift+Tab on first element moves focus to last element', () => {
    const trap = createFocusTrap(container)
    trap.activate()

    const firstBtn = container.querySelector('#first')
    const lastBtn = container.querySelector('#last')
    firstBtn.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true
    })
    container.dispatchEvent(event)

    expect(document.activeElement).toBe(lastBtn)
    trap.deactivate()
  })

  it('Tab on middle element does NOT prevent default (normal tab behavior)', () => {
    const trap = createFocusTrap(container)
    trap.activate()

    const middleBtn = container.querySelector('#middle')
    middleBtn.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
      cancelable: true
    })
    container.dispatchEvent(event)

    // Should not have been prevented (focus stays, browser handles normal tab)
    expect(event.defaultPrevented).toBe(false)
    trap.deactivate()
  })

  it('deactivate removes the keydown listener', () => {
    const trap = createFocusTrap(container)
    trap.activate()
    trap.deactivate()

    const lastBtn = container.querySelector('#last')
    lastBtn.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      bubbles: true,
      cancelable: true
    })
    container.dispatchEvent(event)

    // Focus should NOT have moved since trap is deactivated
    expect(document.activeElement).toBe(lastBtn)
  })

  it('non-Tab keys are ignored', () => {
    const trap = createFocusTrap(container)
    trap.activate()

    const lastBtn = container.querySelector('#last')
    lastBtn.focus()

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true
    })
    container.dispatchEvent(event)

    // Focus should not move
    expect(document.activeElement).toBe(lastBtn)
    trap.deactivate()
  })
})
