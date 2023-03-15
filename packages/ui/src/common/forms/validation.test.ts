import { isValidVariableName, validation } from './validation'

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
describe('isValidVariableName', () => {
  it('should return error message when name is in value variables', async () => {
    expect(
      isValidVariableName(
        [
          {
            name: 'Duplicate',
            description: '',
            max: 1,
            min: 1,
            type: 'continuous',
          },
        ],
        [],
        'Duplicate',
        'value'
      )
    ).toEqual('Duplicate names not allowed')
  })
  it('should return error message when name is in categorical variables', async () => {
    expect(
      isValidVariableName(
        [],
        [
          {
            name: 'Duplicate',
            description: '',
            options: ['A', 'B'],
          },
        ],
        'Duplicate',
        'categorical'
      )
    ).toEqual('Duplicate names not allowed')
  })
  it('should return true when name is not in value variables', async () => {
    expect(
      isValidVariableName(
        [
          {
            name: 'Duplicate',
            description: '',
            max: 1,
            min: 1,
            type: 'continuous',
          },
        ],
        [
          {
            name: 'Test',
            description: '',
            options: ['A', 'B'],
          },
        ],
        'Not duplicate',
        'value'
      )
    ).toEqual(true)
  })
  it('should return true when duplicate is the name being edited', async () => {
    expect(
      isValidVariableName(
        [
          {
            name: 'Duplicate',
            description: '',
            max: 1,
            min: 1,
            type: 'continuous',
          },
        ],
        [],
        'Duplicate',
        'value',
        0
      )
    ).toEqual(true)
  })
})
