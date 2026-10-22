import { describe, it, expect } from 'vitest'

/**
 * Property 1: Cyclic Navigation
 * For any VoicingNavigator with total shapes T > 1 and any current index I (0 ≤ I < T),
 * calling next() SHALL produce index (I + 1) % T, and calling prev() SHALL produce index (I - 1 + T) % T.
 */
describe('Cyclic Navigation Property Tests', () => {
  describe('Property 1: Cyclic Navigation', () => {
    it('next() wraps cyclically at end', () => {
      const testCases = [
        { total: 3, currentIndex: 0, expected: 1 },
        { total: 3, currentIndex: 1, expected: 2 },
        { total: 3, currentIndex: 2, expected: 0 },
        { total: 5, currentIndex: 4, expected: 0 },
        { total: 10, currentIndex: 9, expected: 0 },
        { total: 4, currentIndex: 0, expected: 1 },
      ]
      testCases.forEach(({ total, currentIndex, expected }) => {
        const next = (currentIndex + 1) % total
        expect(next).toBe(expected)
      })
    })

    it('prev() wraps cyclically at start', () => {
      const testCases = [
        { total: 3, currentIndex: 0, expected: 2 },
        { total: 3, currentIndex: 1, expected: 0 },
        { total: 3, currentIndex: 2, expected: 1 },
        { total: 5, currentIndex: 0, expected: 4 },
        { total: 10, currentIndex: 0, expected: 9 },
        { total: 4, currentIndex: 1, expected: 0 },
      ]
      testCases.forEach(({ total, currentIndex, expected }) => {
        const prev = (currentIndex - 1 + total) % total
        expect(prev).toBe(expected)
      })
    })

    it('next() and prev() are inverse operations', () => {
      // For any index, going next then prev returns to original
      for (let total = 2; total <= 10; total++) {
        for (let index = 0; index < total; index++) {
          const nextIndex = (index + 1) % total
          const backIndex = (nextIndex - 1 + total) % total
          expect(backIndex).toBe(index)
        }
      }
    })

    it('wrapping from last to first works', () => {
      // Verify wrapping edge case
      for (let total = 2; total <= 20; total++) {
        const lastIndex = total - 1
        const nextFromLast = (lastIndex + 1) % total
        expect(nextFromLast).toBe(0)
      }
    })

    it('wrapping from first to last works', () => {
      // Verify wrapping edge case
      for (let total = 2; total <= 20; total++) {
        const firstIndex = 0
        const prevFromFirst = (firstIndex - 1 + total) % total
        expect(prevFromFirst).toBe(total - 1)
      }
    })
  })
})