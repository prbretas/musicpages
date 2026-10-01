/**
 * Unit tests for createVoicingNavigator
 * Validates: Requirements 3.3, 3.4, 3.5
 */
const { createVoicingNavigator } = require('../../../scripts/script-fretboard.js');

describe('createVoicingNavigator', function() {
    it('starts at index 0 with indicator "1/T"', function() {
        var nav = createVoicingNavigator(5);
        expect(nav.getIndex()).toBe(0);
        expect(nav.getIndicator()).toBe("1/5");
    });

    it('next() increments index with cyclic wrap', function() {
        var nav = createVoicingNavigator(3);
        expect(nav.next()).toBe(1);
        expect(nav.next()).toBe(2);
        expect(nav.next()).toBe(0); // wraps
        expect(nav.getIndicator()).toBe("1/3");
    });

    it('prev() decrements index with cyclic wrap', function() {
        var nav = createVoicingNavigator(3);
        expect(nav.prev()).toBe(2); // wraps from 0 to last
        expect(nav.getIndicator()).toBe("3/3");
        expect(nav.prev()).toBe(1);
        expect(nav.prev()).toBe(0);
    });

    it('works with total = 1 (single shape)', function() {
        var nav = createVoicingNavigator(1);
        expect(nav.getIndex()).toBe(0);
        expect(nav.getIndicator()).toBe("1/1");
        expect(nav.next()).toBe(0); // stays at 0
        expect(nav.prev()).toBe(0); // stays at 0
    });

    it('getIndicator() returns correct format after mixed navigation', function() {
        var nav = createVoicingNavigator(4);
        nav.next(); // index 1
        nav.next(); // index 2
        expect(nav.getIndicator()).toBe("3/4");
        nav.prev(); // index 1
        expect(nav.getIndicator()).toBe("2/4");
    });
});
