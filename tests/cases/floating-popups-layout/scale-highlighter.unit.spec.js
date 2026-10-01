/**
 * Unit tests for ScaleHighlighter
 * Feature: floating-popups-layout
 * Validates: Requirements 3.3, 3.4, 5.1, 5.3, 5.4
 */
import { describe, it, expect, beforeEach } from 'vitest'

const { ScaleHighlighter } = require('../../../scripts/script-floating-popup.js')

describe('ScaleHighlighter', () => {
  beforeEach(() => {
    // Reset internal state
    ScaleHighlighter.currentScale = null

    // Set up a minimal DOM with the scale table
    document.body.innerHTML = `
      <div id="tabelaGeralEscalasResultado">
        <table>
          <thead><tr><th>Escala / Modo</th><th colspan="8">Estrutura</th></tr></thead>
          <tbody>
            <tr><td class="scale-name-cell">Maior</td><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td><td>2</td><td>1</td></tr>
            <tr><td class="scale-name-cell">Menor Natural</td><td>2</td><td>1</td><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td></tr>
            <tr><td class="scale-name-cell">Menor Harmonica</td><td>2</td><td>1</td><td>2</td><td>2</td><td>1</td><td>3</td><td>1</td></tr>
            <tr><td class="scale-name-cell">Pentatonica Maior</td><td>2</td><td>2</td><td>3</td><td>2</td><td>3</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    `
  })

  describe('highlight(tipoEscala)', () => {
    it('should highlight the row matching the scale key (Req 3.3)', () => {
      ScaleHighlighter.highlight('maior')

      const highlightedRows = document.querySelectorAll('#tabelaGeralEscalasResultado .highlight-row')

      expect(highlightedRows.length).toBe(1)
      expect(highlightedRows[0].querySelector('td').textContent).toBe('Maior')
    })

    it('should store the tipoEscala in currentScale (Req 5.3)', () => {
      ScaleHighlighter.highlight('menor_natural')
      expect(ScaleHighlighter.currentScale).toBe('menor_natural')
    })

    it('should match multi-word scale names (Req 3.3)', () => {
      ScaleHighlighter.highlight('menor_natural')

      const highlightedRows = document.querySelectorAll('#tabelaGeralEscalasResultado .highlight-row')
      expect(highlightedRows.length).toBe(1)
      expect(highlightedRows[0].querySelector('td').textContent).toBe('Menor Natural')
    })

    it('should clear previous highlight before applying new one (Req 3.4)', () => {
      ScaleHighlighter.highlight('maior')
      ScaleHighlighter.highlight('menor_natural')

      const highlightedRows = document.querySelectorAll('#tabelaGeralEscalasResultado .highlight-row')
      expect(highlightedRows.length).toBe(1)
      expect(highlightedRows[0].querySelector('td').textContent).toBe('Menor Natural')
    })

    it('should clear without applying highlight if tipoEscala does not match any row (Req 5.4)', () => {
      ScaleHighlighter.highlight('maior')
      ScaleHighlighter.highlight('escala_inexistente')

      const highlightedRows = document.querySelectorAll('#tabelaGeralEscalasResultado .highlight-row')
      expect(highlightedRows.length).toBe(0)
      expect(ScaleHighlighter.currentScale).toBe('escala_inexistente')
    })

    it('should handle null tipoEscala gracefully (Req 5.4)', () => {
      ScaleHighlighter.highlight('maior')
      ScaleHighlighter.highlight(null)

      const highlightedRows = document.querySelectorAll('#tabelaGeralEscalasResultado .highlight-row')
      expect(highlightedRows.length).toBe(0)
      expect(ScaleHighlighter.currentScale).toBe(null)
    })

    it('should handle empty string tipoEscala gracefully', () => {
      ScaleHighlighter.highlight('maior')
      ScaleHighlighter.highlight('')

      const highlightedRows = document.querySelectorAll('#tabelaGeralEscalasResultado .highlight-row')
      expect(highlightedRows.length).toBe(0)
    })
  })

  describe('clear()', () => {
    it('should remove highlight-row class from all rows', () => {
      ScaleHighlighter.highlight('maior')
      expect(document.querySelectorAll('.highlight-row').length).toBe(1)

      ScaleHighlighter.clear()
      expect(document.querySelectorAll('.highlight-row').length).toBe(0)
    })

    it('should not throw when no rows are highlighted', () => {
      expect(() => ScaleHighlighter.clear()).not.toThrow()
    })

    it('should not throw when table container does not exist', () => {
      document.body.innerHTML = ''
      expect(() => ScaleHighlighter.clear()).not.toThrow()
    })
  })

  describe('_formatarNome', () => {
    it('should capitalize single word', () => {
      expect(ScaleHighlighter._formatarNome('maior')).toBe('Maior')
    })

    it('should capitalize each word separated by underscore', () => {
      expect(ScaleHighlighter._formatarNome('menor_natural')).toBe('Menor Natural')
    })

    it('should handle multi-part names', () => {
      expect(ScaleHighlighter._formatarNome('pentatonica_maior')).toBe('Pentatonica Maior')
    })
  })
})
