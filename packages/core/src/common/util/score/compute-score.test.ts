import { describe, it, expect } from 'vitest'
import {
  computeScore,
  deriveSymbol,
  usedSymbols,
  findUndefinedSymbols,
  findDisabledFactors,
} from './compute-score'
import type { ScoreFunctionType, DataPointType } from '@core/common/types'

describe('deriveSymbol', () => {
  it('sanitises names to valid identifiers', () => {
    expect(deriveSymbol('Wait before stir', [])).toBe('waitBeforeStir')
    expect(deriveSymbol('Weight', [])).toBe('weight')
  })
  it('enforces uniqueness with numeric suffixes', () => {
    expect(deriveSymbol('Weight', ['weight'])).toBe('weight_2')
    expect(deriveSymbol('Weight', ['weight', 'weight_2'])).toBe('weight_3')
  })
})

describe('usedSymbols', () => {
  it('returns referenced symbols', () => {
    expect(usedSymbols('weight/2 + viscosity*2').sort()).toEqual([
      'viscosity',
      'weight',
    ])
  })
  it('returns [] for an unparseable expression', () => {
    expect(usedSymbols('weight/')).toEqual([])
  })
})

describe('findUndefinedSymbols', () => {
  it('finds symbols used in the expression that are not declared (excluding math builtins)', () => {
    const fn = {
      expression: 'a + b * pi + water',
      variables: [
        { name: 'water', symbol: 'water', source: 'response' as const },
      ],
    }
    expect(findUndefinedSymbols(fn).sort()).toEqual(['a', 'b'])
  })

  it('does not flag math builtins (constants or functions)', () => {
    const fn = {
      expression: 'pi + e + sin(0) + sqrt(4)',
      variables: [],
    }
    expect(findUndefinedSymbols(fn)).toEqual([])
  })
})

describe('computeScore', () => {
  const fn: ScoreFunctionType = {
    expression: 'weight/2 + firingAngle/100',
    variables: [
      { name: 'Weight', symbol: 'weight', source: 'response' },
      {
        name: 'Firing angle',
        symbol: 'firingAngle',
        source: 'factor',
        factorName: 'Firing angle',
      },
    ],
  }
  const factorData: DataPointType[] = [
    { type: 'numeric', name: 'Firing angle', value: 120 },
  ]

  it('evaluates responses + factors', () => {
    expect(
      computeScore(fn, [{ symbol: 'weight', value: 10 }], factorData)
    ).toBeCloseTo(6.2)
  })
  it('returns undefined when a response value is missing', () => {
    expect(computeScore(fn, [], factorData)).toBeUndefined()
  })
  it('returns undefined when a referenced factor is absent from the data point', () => {
    expect(
      computeScore(fn, [{ symbol: 'weight', value: 10 }], [])
    ).toBeUndefined()
  })
  it('supports a response-only function', () => {
    const respFn: ScoreFunctionType = {
      expression: 'a + b',
      variables: [
        { name: 'A', symbol: 'a', source: 'response' },
        { name: 'B', symbol: 'b', source: 'response' },
      ],
    }
    expect(
      computeScore(
        respFn,
        [
          { symbol: 'a', value: 2 },
          { symbol: 'b', value: 3 },
        ],
        []
      )
    ).toBe(5)
  })

  it('ignores declared variables the expression does not use', () => {
    // expression uses only `water`; the extra factor vars have no data — must NOT bail
    const fn = {
      expression: 'water',
      variables: [
        {
          name: 'Pin elevation',
          symbol: 'pinElevation',
          source: 'factor' as const,
          factorName: 'Pin elevation',
        },
        {
          name: 'Orangeknas',
          symbol: 'orangeknas',
          source: 'factor' as const,
          factorName: 'Orangeknas',
        },
        { name: 'water', symbol: 'water', source: 'response' as const },
      ],
    }
    const factorData = [
      { type: 'numeric' as const, name: 'Pin elevation', value: 130 },
    ]
    expect(computeScore(fn, [{ symbol: 'water', value: 4 }], factorData)).toBe(
      4
    )
  })

  it('still returns undefined when a USED symbol cannot be resolved', () => {
    const fn = {
      expression: 'pinElevation + water',
      variables: [
        {
          name: 'Pin elevation',
          symbol: 'pinElevation',
          source: 'factor' as const,
          factorName: 'Pin elevation',
        },
        { name: 'water', symbol: 'water', source: 'response' as const },
      ],
    }
    // Pin elevation used but absent from factorData -> undefined
    expect(
      computeScore(fn, [{ symbol: 'water', value: 4 }], [])
    ).toBeUndefined()
  })
})

describe('findDisabledFactors', () => {
  const fnUsing = (factorName: string, symbol: string): ScoreFunctionType => ({
    expression: symbol,
    variables: [{ name: factorName, symbol, source: 'factor', factorName }],
  })

  it('flags a used factor that is not an enabled value variable', () => {
    expect(
      findDisabledFactors(fnUsing('Pin elevation', 'pinElevation'), [])
    ).toEqual(['Pin elevation'])
  })

  it('does not flag when the factor is enabled', () => {
    expect(
      findDisabledFactors(fnUsing('Pin elevation', 'pinElevation'), [
        'Pin elevation',
      ])
    ).toEqual([])
  })

  it('ignores a disabled factor the expression does not use', () => {
    const fn: ScoreFunctionType = {
      expression: 'water',
      variables: [
        {
          name: 'Orangeknas',
          symbol: 'orangeknas',
          source: 'factor',
          factorName: 'Orangeknas',
        },
        { name: 'water', symbol: 'water', source: 'response' },
      ],
    }
    expect(findDisabledFactors(fn, [])).toEqual([])
  })
})
