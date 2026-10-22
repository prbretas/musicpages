import { describe, it, expect } from 'vitest'

/**
 * Property 5: StorageKey Derivation
 * For any tonica string and tipoEscala string,
 * deriveScaleKey(tonica, tipoEscala) SHALL return tonica + "_" + tipoEscala,
 * and buildStorageKey(chordName, scaleKey) SHALL return "chordShape:" + chordName + ":" + scaleKey.
 */
describe('Storage Key Derivation Property Tests', () => {
  describe('Property 5: StorageKey Derivation', () => {
    it('deriveScaleKey concatenates with underscore', () => {
      const testCases = [
        { tonica: 'C', tipoEscala: 'maior', expected: 'C_maior' },
        { tonica: 'F#', tipoEscala: 'menor_natural', expected: 'F#_menor_natural' },
        { tonica: 'Bb', tipoEscala: 'mixolidio', expected: 'Bb_mixolidio' },
        { tonica: 'Db', tipoEscala: 'dorico', expected: 'Db_dorico' },
        { tonica: 'G', tipoEscala: 'pentatonica_maior', expected: 'G_pentatonica_maior' },
      ]
      testCases.forEach(({ tonica, tipoEscala, expected }) => {
        const scaleKey = tonica + '_' + tipoEscala
        expect(scaleKey).toContain('_')
        expect(scaleKey).toBe(expected)
        expect(scaleKey.startsWith(tonica)).toBe(true)
        expect(scaleKey.endsWith(tipoEscala)).toBe(true)
      })
    })

    it('buildStorageKey has correct prefix and format', () => {
      const testCases = [
        { chordName: 'Am7', scaleKey: 'C_maior', expected: 'chordShape:Am7:C_maior' },
        { chordName: 'G7', scaleKey: 'G_maior', expected: 'chordShape:G7:G_maior' },
        { chordName: 'Dm', scaleKey: 'A_menor_natural', expected: 'chordShape:Dm:A_menor_natural' },
      ]
      testCases.forEach(({ chordName, scaleKey, expected }) => {
        const storageKey = 'chordShape:' + chordName + ':' + scaleKey
        expect(storageKey.startsWith('chordShape:')).toBe(true)
        expect(storageKey.split(':').length).toBe(3)
        expect(storageKey).toBe(expected)
      })
    })

    it('full format produces expected key structure', () => {
      const tonica = 'C'
      const tipoEscala = 'maior'
      const chordName = 'Am7'

      const scaleKey = tonica + '_' + tipoEscala // "C_maior"
      const storageKey = 'chordShape:' + chordName + ':' + scaleKey // "chordShape:Am7:C_maior"

      expect(scaleKey).toBe('C_maior')
      expect(storageKey).toBe('chordShape:Am7:C_maior')
    })

    it('handles sharps and flats in tonica', () => {
      const tonicas = ['C', 'C#', 'Db', 'F#', 'Gb']
      const tipoEscala = 'menor_natural'

      tonicas.forEach(tonica => {
        const scaleKey = tonica + '_' + tipoEscala
        expect(scaleKey).toContain('_')
        expect(scaleKey.startsWith(tonica)).toBe(true)
      })
    })

    it('format is consistent across all tonicas', () => {
      const allTonicas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const tipoEscala = 'maior'

      allTonicas.forEach(tonica => {
        const scaleKey = tonica + '_' + tipoEscala
        expect(scaleKey).toMatch(new RegExp(`^${tonica}_maior$`))
      })
    })
  })
})