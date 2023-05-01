import { ValueVariableType } from '@core/common'

export const createContinuousVariable = (name: string, min = 0, max = 100) =>
  ({
    type: 'continuous',
    name: name,
    description: '',
    min,
    max,
  } satisfies ValueVariableType)
