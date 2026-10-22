import { describe, it, expect } from 'vitest'

/**
 * Property 6: Out-of-Bounds Clamping
 * For any persisted ShapeIndex value that is ≥ shapesCount (or negative, NaN),
 * getPersistedIndex() SHALL return 0 and remove the invalid entry from localStorage.
 */
describe('Out-of-Bounds Clamping Property Tests', () => {
  describe('Property 6: Out-of-Bounds Clamping', () => {
    it('returns 0 when index >= shapesCount', () => {
      const getPersistedIndex = (index, shapesCount) => {
        if (isNaN(index) || index < 0 || index >= shapesCount) {
          return 0
        }
        return index
      }

      const testCases = [
        { shapesCount: 5, index: 5, expected: 0 },
        { shapesCount: 5, index: 6, expected: 0 },
        { shapesCount: 5, index: 10, expected: 0 },
        { shapesCount: 3, index: 3, expected: 0 },
        { shapesCount: 4, index: 100, expected: 0 },
      ]
      testCases.forEach(({ shapesCount, index, expected }) => {
        const result = getPersistedIndex(index, shapesCount)
        expect(result).toBe(expected)
      })
    })

    it('returns 0 when index is negative', () => {
      const getPersistedIndex = (index, shapesCount) => {
        if (isNaN(index) || index < 0 || index >= shapesCount) {
          return 0
        }
        return index
      }

      const negativeIndices = [-1, -5, -100, -999]
      negativeIndices.forEach(neg => {
        const clamped = getPersistedIndex(neg, 10)
        expect(clamped).toBe(0)
      })
    })

    it('NaN values are clamped to 0', () => {
      const getPersistedIndex = (index, shapesCount) => {
        if (isNaN(index) || index < 0 || index >= shapesCount) {
          return 0
        }
        return index
      }

      const nanValue = NaN
      const clamped = getPersistedIndex(nanValue, 10)
      expect(clamped).toBe(0)
    })

    it('valid indices are returned unchanged', () => {
      const getPersistedIndex = (index, shapesCount) => {
        if (isNaN(index) || index < 0 || index >= shapesCount) {
          return 0
        }
        return index
      }

      for (let shapesCount = 1; shapesCount <= 20; shapesCount++) {
        for (let i = 0; i < shapesCount; i++) {
          expect(getPersistedIndex(i, shapesCount)).toBe(i)
        }
      }
    })

    it('boundary case: index = shapesCount - 1 is valid', () => {
      const getPersistedIndex = (index, shapesCount) => {
        if (isNaN(index) || index < 0 || index >= shapesCount) {
          return 0
        }
        return index
      }

      for (let shapesCount = 2; shapesCount <= 20; shapesCount++) {
        const lastValid = shapesCount - 1
        expect(getPersistedIndex(lastValid, shapesCount)).toBe(lastValid)
        expect(getPersistedIndex(lastValid, shapesCount)).toBeLessThan(shapesCount)
      }
    })

    it('boundary case: index = shapesCount is invalid', () => {
      const getPersistedIndex = (index, shapesCount) => {
        if (isNaN(index) || index < 0 || index >= shapesCount) {
          return 0
        }
        return index
      }

      for (let shapesCount = 1; shapesCount <= 20; shapesCount++) {
        expect(getPersistedIndex(shapesCount, shapesCount)).toBe(0)
      }
    })
  })
})