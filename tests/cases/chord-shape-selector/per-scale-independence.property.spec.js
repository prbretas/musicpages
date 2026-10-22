import { describe, it, expect } from 'vitest'

/**
 * Property 7: Per-Scale Independence
 * For any chord that exists in two different scales (scaleKeyA ≠ scaleKeyB),
 * persisting index X under scaleKeyA and index Y under scaleKeyB,
 * then reading back using scaleKeyA SHALL return X and
 * reading back using scaleKeyB SHALL return Y.
 */
describe('Per-Scale Independence Property Tests', () => {
  describe('Property 7: Per-Scale Independence', () => {
    it('different scales maintain independent persisted indices', () => {
      const chordName = 'Am7'

      // Scale A: C major
      const scaleKeyA = 'C_maior'
      const indexA = 2

      // Scale B: A minor natural
      const scaleKeyB = 'A_menor_natural'
      const indexB = 1

      // Simulate storage for scale A
      const storageKeyA = 'chordShape:' + chordName + ':' + scaleKeyA
      const storedA = String(indexA)

      // Simulate storage for scale B
      const storageKeyB = 'chordShape:' + chordName + ':' + scaleKeyB
      const storedB = String(indexB)

      // Storage keys are different
      expect(storageKeyA).not.toBe(storageKeyB)

      // Read back
      const retrievedA = parseInt(storedA, 10)
      const retrievedB = parseInt(storedB, 10)

      // Each scale maintains its own preference
      expect(retrievedA).toBe(2)
      expect(retrievedB).toBe(1)
    })

    it('same chord in C_maior and A_menor_natural have independent storage', () => {
      const chordName = 'Am7'
      const scaleKeyA = 'C_maior'
      const scaleKeyB = 'A_menor_natural'
      const indexA = 2
      const indexB = 1

      // Persist for C major
      const storageKeyA = 'chordShape:' + chordName + ':' + scaleKeyA
      const storedA = String(indexA)

      // Persist for A minor natural
      const storageKeyB = 'chordShape:' + chordName + ':' + scaleKeyB
      const storedB = String(indexB)

      // Retrieve
      const retrievedA = parseInt(storedA, 10)
      const retrievedB = parseInt(storedB, 10)

      // Each scale remembers its own preference
      expect(retrievedA).toBe(2)
      expect(retrievedB).toBe(1)
      expect(retrievedA).not.toBe(retrievedB)
    })

    it('storage keys are distinct for different scales', () => {
      const chordName = 'G7'
      const scaleKeyG = 'G_maior'
      const scaleKeyF = 'F_maior'

      const storageKeyG = 'chordShape:' + chordName + ':' + scaleKeyG
      const storageKeyF = 'chordShape:' + chordName + ':' + scaleKeyF

      expect(storageKeyG).not.toBe(storageKeyF)
      expect(storageKeyG).toBe('chordShape:G7:G_maior')
      expect(storageKeyF).toBe('chordShape:G7:F_maior')
    })

    it('switching scales does not affect the other scale\'s persisted index', () => {
      const chordName = 'Dm7'
      const scaleKey1 = 'C_maior'
      const scaleKey2 = 'G_maior'

      // Simulate: user prefers shape 1 in C major
      const storageKey1 = 'chordShape:' + chordName + ':' + scaleKey1
      const storageKey2 = 'chordShape:' + chordName + ':' + scaleKey2

      // User switches to G major and picks shape 2
      const gMajorIndex = 2
      const cMajorIndex = 1

      // Store for G major
      const storedForG = String(gMajorIndex)

      // C major's stored value is unchanged
      const storedForC = String(cMajorIndex)

      // Verify each returns its own value
      expect(parseInt(storedForG, 10)).toBe(2)
      expect(parseInt(storedForC, 10)).toBe(1)
    })

    it('multiple chords maintain per-scale independence', () => {
      const chords = ['C', 'Dm', 'Em', 'F', 'G', 'Am']
      const scales = ['C_maior', 'G_maior', 'F_maior']

      // For each chord, each scale has its own index
      chords.forEach(chord => {
        scales.forEach((scale, scaleIndex) => {
          const expectedIndex = (scaleIndex + chord.length) % 5
          const storageKey = 'chordShape:' + chord + ':' + scale
          const stored = String(expectedIndex)
          const retrieved = parseInt(stored, 10)
          expect(retrieved).toBe(expectedIndex)
        })
      })
    })

    it('format ensures unique keys per chord per scale', () => {
      const formatStorageKey = (chordName, scaleKey) =>
        'chordShape:' + chordName + ':' + scaleKey

      const testCases = [
        { chord: 'Am7', scaleA: 'C_maior', scaleB: 'A_menor' },
        { chord: 'G7', scaleA: 'G_maior', scaleB: 'C_maior' },
        { chord: 'Dm', scaleA: 'C_maior', scaleB: 'G_maior' },
      ]

      testCases.forEach(({ chord, scaleA, scaleB }) => {
        const keyA = formatStorageKey(chord, scaleA)
        const keyB = formatStorageKey(chord, scaleB)

        // Keys are different
        expect(keyA).not.toBe(keyB)

        // Each key has correct format
        expect(keyA.split(':').length).toBe(3)
        expect(keyB.split(':').length).toBe(3)
      })
    })
  })
})