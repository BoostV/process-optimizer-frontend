import { describe, expect, it } from 'vitest'
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
            enabled: true,
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
            enabled: true,
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
            enabled: true,
          },
        ],
        [
          {
            name: 'Test',
            description: '',
            options: ['A', 'B'],
            enabled: true,
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
            enabled: true,
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

describe('isValidVariableName with reserved names', () => {
  it('rejects a factor name that a score already uses, ignoring case and spaces', () => {
    expect(
      isValidVariableName([], [], ' yield ', 'value', undefined, ['Yield'])
    ).toBe('A score already has this name')
    expect(
      isValidVariableName([], [], 'Yield', 'categorical', undefined, ['Yield'])
    ).toBe('A score already has this name')
  })
  it('accepts other names, and any name when nothing is reserved', () => {
    expect(
      isValidVariableName([], [], 'Water', 'value', undefined, ['Yield'])
    ).toBe(true)
    expect(isValidVariableName([], [], 'Yield', 'value')).toBe(true)
  })
})
