import { isValidValueVariableName, validation } from './validation'

describe('validation', () => {
  describe('mustBeNumber', () => {
    it('should return true only when value is number', async () => {
      const regex = new RegExp(validation.mustBeNumber.pattern.value)
      expect(regex.test('8')).toBeTruthy()
      expect(regex.test('80')).toBeTruthy()
      expect(regex.test('0.8')).toBeTruthy()
      expect(regex.test('0,8')).toBeTruthy()
      expect(regex.test('-8')).toBeTruthy()
      expect(regex.test('-0.8')).toBeTruthy()
      expect(regex.test('-0,8')).toBeTruthy()
      expect(regex.test('a')).toBeFalsy()
      expect(regex.test('-')).toBeFalsy()
      expect(regex.test('.')).toBeFalsy()
      expect(regex.test('.8')).toBeFalsy()
      expect(regex.test(',8')).toBeFalsy()
    })
  })
  describe('isValidValueVariableName', () => {
    it('should return false when name is in value variables', async () => {
      expect(
        isValidValueVariableName(
          [
            {
              name: 'Duplicate',
              description: '',
              max: 1,
              min: 1,
              type: 'continuous',
            },
          ],
          'Duplicate'
        )
      ).toEqual('Duplicate names not allowed')
    })
    it('should return true when name is not in value variables', async () => {
      expect(
        isValidValueVariableName(
          [
            {
              name: 'Duplicate',
              description: '',
              max: 1,
              min: 1,
              type: 'continuous',
            },
          ],
          'Not duplicate'
        )
      ).toBeTruthy()
    })
  })
})
