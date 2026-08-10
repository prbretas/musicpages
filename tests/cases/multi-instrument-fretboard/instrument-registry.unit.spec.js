import { describe, it, expect } from 'vitest'

const InstrumentRegistry = require('../../../scripts/script-instrument-registry.js')

describe('InstrumentRegistry', () => {
  describe('getAll()', () => {
    it('returns all 7 profiles in correct order', () => {
      const profiles = InstrumentRegistry.getAll()
      expect(profiles).toHaveLength(7)
      expect(profiles[0].id).toBe('guitarra-6')
      expect(profiles[6].id).toBe('violao-7')
    })

    it('each profile has a unique id', () => {
      const profiles = InstrumentRegistry.getAll()
      const ids = profiles.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('returns a copy — modifying it does not affect registry', () => {
      const profiles = InstrumentRegistry.getAll()
      profiles.push({ id: 'fake' })
      const profilesAgain = InstrumentRegistry.getAll()
      expect(profilesAgain).toHaveLength(7)
    })
  })

  describe('getById()', () => {
    it('returns the correct profile for guitarra-6', () => {
      const profile = InstrumentRegistry.getById('guitarra-6')
      expect(profile).not.toBeNull()
      expect(profile.id).toBe('guitarra-6')
      expect(profile.name).toBe('Guitarra 6 cordas')
      expect(profile.strings).toBe(6)
      expect(profile.tuning).toHaveLength(6)
    })

    it('returns null for a nonexistent id', () => {
      const profile = InstrumentRegistry.getById('nonexistent')
      expect(profile).toBeNull()
    })
  })

  describe('getDefaultId()', () => {
    it('returns guitarra-6 as the default profile id', () => {
      expect(InstrumentRegistry.getDefaultId()).toBe('guitarra-6')
    })
  })
})
