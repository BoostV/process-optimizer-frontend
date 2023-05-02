import {
  CategoricalVariableType,
  DataEntry,
  DataPointType,
  ScoreVariableType,
  ValueVariableType,
} from '@core/common'

export const createValueVariable = (input: Partial<ValueVariableType>) =>
  ({
    type: input.type ?? 'continuous',
    name: input.name ?? 'name',
    description: input.description ?? '',
    min: input.min ?? 0,
    max: input.max ?? 100,
    enabled: input.enabled ?? true,
  } satisfies ValueVariableType)

export const createCategoricalVariable = (
  input: Partial<CategoricalVariableType>
) =>
  ({
    name: input.name ?? 'name',
    description: input.description ?? '',
    options: input.options ?? ['option1', 'option2'],
    enabled: input.enabled ?? true,
  } satisfies CategoricalVariableType)

export const createScoreVariable = (input: Partial<ScoreVariableType>) =>
  ({
    name: input.name ?? 'name',
    description: input.description ?? '',
    enabled: input.enabled ?? true,
  } satisfies ScoreVariableType)

export const createDataPoints = (
  count: number,
  values = ['Water'],
  categorical = ['Icing'],
  scores = ['score'],
  randomize = false
): DataEntry[] => {
  const valueData: DataPointType[] = values.map(name => ({
    name,
    type: 'numeric',
    value: randomize ? Math.random() * 100 : 100,
  }))
  const categoricalData: DataPointType[] = categorical.map(name => ({
    name,
    type: 'categorical',
    value: 'Vanilla',
  }))
  const scoreData: DataPointType[] = scores.map(name => ({
    name,
    type: 'score',
    value: randomize ? Math.random() * 10 : 2,
  }))
  return [...Array(count)].map((_id, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data: valueData.concat(categoricalData, scoreData),
  }))
}
