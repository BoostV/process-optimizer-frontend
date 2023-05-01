import { ValueVariableType } from '@core/common'

export const createContinuousVariable = (input: Partial<ValueVariableType>) =>
  ({
    type: input.type ?? 'continuous',
    name: input.name ?? 'name',
    description: input.description ?? '',
    min: input.min ?? 0,
    max: input.max ?? 100,
    enabled: input.enabled ?? true,
  } satisfies ValueVariableType)
