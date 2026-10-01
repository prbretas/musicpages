/**
 * Unit tests for createFretboardShapeNavigator
 * Validates: Requirements 3.1, 3.2, 3.5, 6.3, 6.4
 */
import { describe, it, expect, beforeEach } from 'vitest'

const { createFretboardShapeNavigator, createVoicingNavigator } = require('../../../scripts/script-fretboard.js');

describe('createFretboardShapeNavigator', () => {
    beforeEach(() => {
        // Set up minimal DOM with fretboardContainer
        document.body.innerHTML = '<div id="fretboardContainer"><div id="fretboard"></div></div>';
    });

    describe('noop behavior (single shape or empty)', () => {
        it('returns noop object when shapes has only 1 element', () => {
            var result = createFretboardShapeNavigator([{ frets: [0, 0, 1, 2, 2, 0] }], function() {});
            expect(result).toHaveProperty('destroy');
            expect(result).toHaveProperty('update');
            // Should not create DOM
            var nav = document.querySelector('.fretboard-shape-nav');
            expect(nav).toBeNull();
        });

        it('returns noop object when shapes is empty', () => {
            var result = createFretboardShapeNavigator([], function() {});
            expect(result).toHaveProperty('destroy');
            expect(result).toHaveProperty('update');
            var nav = document.querySelector('.fretboard-shape-nav');
            expect(nav).toBeNull();
        });

        it('returns noop object when shapes is null', () => {
            var result = createFretboardShapeNavigator(null, function() {});
            expect(result).toHaveProperty('destroy');
            expect(result).toHaveProperty('update');
        });

        it('noop destroy and update do nothing without error', () => {
            var result = createFretboardShapeNavigator([{ frets: [1] }], function() {});
            expect(() => result.destroy()).not.toThrow();
            expect(() => result.update(0, 1)).not.toThrow();
        });
    });

    describe('DOM rendering (multiple shapes)', () => {
        var shapes = [
            { frets: [0, 0, 1, 2, 2, 0], startFret: 0 },
            { frets: [-1, 0, 2, 2, 1, 0], startFret: 0 },
            { frets: [3, 3, 5, 5, 5, 3], startFret: 3 }
        ];

        it('creates DOM container when shapes.length > 1', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var nav = document.querySelector('.fretboard-shape-nav');
            expect(nav).not.toBeNull();
        });

        it('creates prev button with correct aria-label', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            expect(buttons[0].getAttribute('aria-label')).toBe('Shape anterior');
            expect(buttons[0].textContent).toBe('\u25C0');
        });

        it('creates next button with correct aria-label', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            expect(buttons[1].getAttribute('aria-label')).toBe('Próximo shape');
            expect(buttons[1].textContent).toBe('\u25B6');
        });

        it('creates indicator span with initial "1/N" format', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var indicator = document.querySelector('.chord-voicing-indicator');
            expect(indicator).not.toBeNull();
            expect(indicator.textContent).toBe('1/3');
        });

        it('appends container to #fretboardContainer', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var container = document.getElementById('fretboardContainer');
            var nav = container.querySelector('.fretboard-shape-nav');
            expect(nav).not.toBeNull();
        });
    });

    describe('navigation behavior', () => {
        var shapes = [
            { frets: [0, 0, 1, 2, 2, 0], startFret: 0 },
            { frets: [-1, 0, 2, 2, 1, 0], startFret: 0 },
            { frets: [3, 3, 5, 5, 5, 3], startFret: 3 }
        ];

        it('calls onNavigate with index 1 after clicking next', () => {
            var navigatedIndex = -1;
            createFretboardShapeNavigator(shapes, function(idx) {
                navigatedIndex = idx;
            });
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            buttons[1].click(); // next
            expect(navigatedIndex).toBe(1);
        });

        it('updates indicator after clicking next', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            buttons[1].click(); // next
            var indicator = document.querySelector('.chord-voicing-indicator');
            expect(indicator.textContent).toBe('2/3');
        });

        it('wraps to first after clicking next on last shape', () => {
            var lastIndex = -1;
            createFretboardShapeNavigator(shapes, function(idx) {
                lastIndex = idx;
            });
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            buttons[1].click(); // 1
            buttons[1].click(); // 2
            buttons[1].click(); // wraps to 0
            expect(lastIndex).toBe(0);
            var indicator = document.querySelector('.chord-voicing-indicator');
            expect(indicator.textContent).toBe('1/3');
        });

        it('calls onNavigate with last index after clicking prev from start', () => {
            var navigatedIndex = -1;
            createFretboardShapeNavigator(shapes, function(idx) {
                navigatedIndex = idx;
            });
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            buttons[0].click(); // prev wraps to 2
            expect(navigatedIndex).toBe(2);
            var indicator = document.querySelector('.chord-voicing-indicator');
            expect(indicator.textContent).toBe('3/3');
        });
    });

    describe('destroy and update', () => {
        var shapes = [
            { frets: [0, 0, 1, 2, 2, 0], startFret: 0 },
            { frets: [-1, 0, 2, 2, 1, 0], startFret: 0 }
        ];

        it('destroy removes DOM from fretboardContainer', () => {
            var result = createFretboardShapeNavigator(shapes, function() {});
            expect(document.querySelector('.fretboard-shape-nav')).not.toBeNull();
            result.destroy();
            expect(document.querySelector('.fretboard-shape-nav')).toBeNull();
        });

        it('update changes indicator text', () => {
            var result = createFretboardShapeNavigator(shapes, function() {});
            result.update(4, 10);
            var indicator = document.querySelector('.chord-voicing-indicator');
            expect(indicator.textContent).toBe('5/10');
        });
    });

    describe('accessibility', () => {
        var shapes = [
            { frets: [0, 0, 1, 2, 2, 0], startFret: 0 },
            { frets: [-1, 0, 2, 2, 1, 0], startFret: 0 }
        ];

        it('buttons are native button elements (focusable and operable via keyboard)', () => {
            createFretboardShapeNavigator(shapes, function() {});
            var buttons = document.querySelectorAll('.fretboard-shape-nav button');
            expect(buttons.length).toBe(2);
            // Native buttons handle Enter/Space natively
            expect(buttons[0].tagName).toBe('BUTTON');
            expect(buttons[1].tagName).toBe('BUTTON');
        });
    });
});
