import { validation } from './validation'

describe('validation', () => {
  describe('mustBeNumber', () => {
    it('should return true only when value is number', async () => {
      const regex = new RegExp(validation.mustBeNumber.pattern.value)
      expect(regex.test('8')).toBeTruthy()
      expect(regex.test('80')).toBeTruthy()
      expect(regex.test('0.8')).toBeTruthy()
      expect(regex.test('-8')).toBeTruthy()
      expect(regex.test('-0.8')).toBeTruthy()
      expect(regex.test('a')).toBeFalsy()
      expect(regex.test('-')).toBeFalsy()
      expect(regex.test('.')).toBeFalsy()
      expect(regex.test('.8')).toBeFalsy()
    })
  })
})
