/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';

const {
    renderTogglePanel,
    resetToggles,
    getToggleStates,
    SHAPE_BUTTON_COLORS
} = require('../../../scripts/script-scale-shapes.js');

describe('scale-shapes-caged: ShapeTogglePanel', () => {
    beforeEach(() => {
        // Setup minimal DOM with fretboardContainer and fretboard
        document.body.innerHTML = `
            <div id="fretboardContainer">
                <h2>Fretboard</h2>
                <div id="fretboard"></div>
            </div>
        `;
    });

    describe('renderTogglePanel', () => {
        it('creates a panel with class shape-toggle-panel', () => {
            renderTogglePanel(5, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            expect(panel).not.toBeNull();
        });

        it('renders one button per shape', () => {
            renderTogglePanel(7, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            var buttons = panel.querySelectorAll('button');
            expect(buttons.length).toBe(7);
        });

        it('buttons have 1-based labels', () => {
            renderTogglePanel(5, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            var buttons = panel.querySelectorAll('button');
            expect(buttons[0].textContent).toBe('1');
            expect(buttons[4].textContent).toBe('5');
        });

        it('panel is positioned before fretboard element', () => {
            renderTogglePanel(3, function() {});
            var fretboardContainer = document.getElementById('fretboardContainer');
            var fretboard = document.getElementById('fretboard');
            var panel = document.querySelector('.shape-toggle-panel');
            // Panel should come before fretboard in DOM order
            var children = Array.from(fretboardContainer.children);
            var panelIdx = children.indexOf(panel);
            var fretboardIdx = children.indexOf(fretboard);
            expect(panelIdx).toBeLessThan(fretboardIdx);
        });

        it('active buttons have shape color as background', () => {
            renderTogglePanel(3, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            var buttons = panel.querySelectorAll('button');
            expect(buttons[0].style.backgroundColor).toBe(SHAPE_BUTTON_COLORS[0]);
            expect(buttons[1].style.backgroundColor).toBe(SHAPE_BUTTON_COLORS[1]);
            expect(buttons[2].style.backgroundColor).toBe(SHAPE_BUTTON_COLORS[2]);
        });

        it('clicking a button toggles it to gray (#666)', () => {
            var toggled = [];
            renderTogglePanel(3, function(idx, active) {
                toggled.push({ idx, active });
            });
            var panel = document.querySelector('.shape-toggle-panel');
            var btn = panel.querySelectorAll('button')[1];
            btn.click();
            expect(btn.style.backgroundColor).toBe('rgb(102, 102, 102)');
            expect(toggled[0]).toEqual({ idx: 1, active: false });
        });

        it('clicking a toggled-off button restores its color', () => {
            renderTogglePanel(3, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            var btn = panel.querySelectorAll('button')[0];
            btn.click(); // off
            btn.click(); // on
            expect(btn.style.backgroundColor).toBe(SHAPE_BUTTON_COLORS[0]);
        });

        it('re-rendering clears and rebuilds the panel', () => {
            renderTogglePanel(5, function() {});
            renderTogglePanel(3, function() {});
            var panels = document.querySelectorAll('.shape-toggle-panel');
            expect(panels.length).toBe(1);
            var buttons = panels[0].querySelectorAll('button');
            expect(buttons.length).toBe(3);
        });
    });

    describe('getToggleStates', () => {
        it('returns all true after renderTogglePanel', () => {
            renderTogglePanel(5, function() {});
            var states = getToggleStates();
            expect(states).toEqual([true, true, true, true, true]);
        });

        it('reflects toggled-off state', () => {
            renderTogglePanel(3, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            panel.querySelectorAll('button')[1].click();
            var states = getToggleStates();
            expect(states).toEqual([true, false, true]);
        });

        it('returns a copy (no external mutation)', () => {
            renderTogglePanel(3, function() {});
            var states = getToggleStates();
            states[0] = false;
            expect(getToggleStates()[0]).toBe(true);
        });
    });

    describe('resetToggles', () => {
        it('sets all toggles back to active', () => {
            renderTogglePanel(4, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            panel.querySelectorAll('button')[0].click();
            panel.querySelectorAll('button')[2].click();
            resetToggles();
            expect(getToggleStates()).toEqual([true, true, true, true]);
        });

        it('restores button colors to shape colors', () => {
            renderTogglePanel(3, function() {});
            var panel = document.querySelector('.shape-toggle-panel');
            var buttons = panel.querySelectorAll('button');
            buttons[0].click(); // gray
            buttons[1].click(); // gray
            resetToggles();
            expect(buttons[0].style.backgroundColor).toBe(SHAPE_BUTTON_COLORS[0]);
            expect(buttons[1].style.backgroundColor).toBe(SHAPE_BUTTON_COLORS[1]);
        });
    });
});
