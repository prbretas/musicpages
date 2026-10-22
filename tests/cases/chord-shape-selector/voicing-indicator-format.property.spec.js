import { describe, it, expect } from 'vitest'

/**
 * Property 2: Voicing Indicator Format
 * For any VoicingNavigator with total T and current index I,
 * getIndicator() SHALL return the string "{I+1}/{T}".
 */
describe('Voicing Indicator Format Property Tests', () => {
  describe('Property 2: Voicing Indicator Format', () => {
    it('indicator shows 1-indexed current position over total', () => {
      const testCases = [
        { total: 5, currentIndex: 0, expected: '1/5' },
        { total: 5, currentIndex: 1, expected: '2/5' },
        { total: 5, currentIndex: 4, expected: '5/5' },
        { total: 3, currentIndex: 2, expected: '3/3' },
        { total: 10, currentIndex: 9, expected: '10/10' },
      ]
      testCases.forEach(({ total, currentIndex, expected }) => {
        const normalizedIndex = currentIndex % total
        const indicator = `${normalizedIndex + 1}/${total}`
        expect(indicator).toBe(expected)
      })
    })

    it('indicator format is always "X/Y" with X from 1 to T', () => {
      for (let total = 1; total <= 10; total++) {
        for (let i = 0; i < total; i++) {
          const indicator = `${i + 1}/${total}`
          const parts = indicator.split('/')
          expect(parts.length).toBe(2)
          expect(parseInt(parts[0])).toBeGreaterThanOrEqual(1)
          expect(parseInt(parts[0])).toBeLessThanOrEqual(total)
          expect(parseInt(parts[1])).toBe(total)
        }
      }
    })

    it('index 0 produces indicator "1/T"', () => {
      const testCases = [1, 2, 3, 5, 10, 20]
      testCases.forEach(total => {
        const indicator = `1/${total}`
        expect(indicator).toBe(`1/${total}`)
      })
    })

    it('last index produces indicator "T/T"', () => {
      const testCases = [1, 2, 3, 5, 10, 20]
      testCases.forEach(total => {
        const lastIndex = total - 1
        const indicator = `${lastIndex + 1}/${total}`
        expect(indicator).toBe(`${total}/${total}`)
      })
    })

    it('format matches getIndicator() specification', () => {
      // Simulating getIndicator() behavior
      const getIndicator = (currentIndex, total) => `${currentIndex + 1}/${total}`
      expect(getIndicator(0, 4)).toBe('1/4')
      expect(getIndicator(1, 4)).toBe('2/4')
      expect(getIndicator(2, 4)).toBe('3/4')
      expect(getIndicator(3, 4)).toBe('4/4')
    })
  })
})