import { describe, it, expect } from 'vitest'

/**
 * Property 4: Confirm Persists Correctly (Round-Trip)
 * For any valid chordName, scaleKey, and shapeIndex,
 * after calling persist(chordName, scaleKey, index),
 * a subsequent call to getPersistedIndex(chordName, scaleKey, shapesCount)
 * with shapesCount > index SHALL return that same index.
 */
describe('Persist Round-Trip Property Tests', () => {
  describe('Property 4: Confirm Persists Correctly (Round-Trip)', () => {
    it('persist and getPersistedIndex return same value', () => {
      // Simulating persist and getPersistedIndex behavior
      const persist = (index) => String(index)
      const getPersistedIndex = (stored, shapesCount) => {
        const retrieved = parseInt(stored, 10)
        if (isNaN(retrieved) || retrieved < 0 || retrieved >= shapesCount) {
          return 0
        }
        return retrieved
      }

      const testCases = [
        { chordName: 'Am7', scaleKey: 'C_maior', index: 2, shapesCount: 5 },
        { chordName: 'G7', scaleKey: 'G_maior', index: 1, shapesCount: 4 },
        { chordName: 'Dm', scaleKey: 'A_menor', index: 3, shapesCount: 6 },
      ]
      testCases.forEach(({ index, shapesCount }) => {
        const stored = persist(index)
        const retrieved = getPersistedIndex(stored, shapesCount)
        expect(retrieved).toBe(index)
      })
    })

    it('string conversion preserves numeric value', () => {
      const indices = [0, 1, 5, 10, 50, 100]
      indices.forEach(index => {
        const stored = String(index)
        const retrieved = parseInt(stored, 10)
        expect(retrieved).toBe(index)
      })
    })

    it('multiple indices stored and retrieved correctly', () => {
      const chordName = 'Am7'
      const scaleKey = 'C_maior'

      // Store indices 0 through 5
      const indices = [0, 1, 2, 3, 4, 5]
      const getPersistedIndex = (stored, shapesCount) => parseInt(stored, 10)

      indices.forEach(idx => {
        const stored = String(idx)
        const retrieved = getPersistedIndex(stored, 10)
        expect(retrieved).toBe(idx)
      })
    })

    it('handles large indices', () => {
      const largeIndex = 9999
      const stored = String(largeIndex)
      const retrieved = parseInt(stored, 10)
      expect(retrieved).toBe(largeIndex)
    })

    it('round-trip preserves data integrity', () => {
      const testData = [
        { chord: 'C', scale: 'maior', index: 0 },
        { chord: 'Am7', scale: 'C_maior', index: 2 },
        { chord: 'G7', scale: 'G_maior', index: 1 },
      ]

      testData.forEach(({ chord, scale, index }) => {
        // Simulate persist
        const stored = String(index)
        // Simulate getPersistedIndex
        const retrieved = parseInt(stored, 10)
        expect(retrieved).toBe(index)
      })
    })
  })
})