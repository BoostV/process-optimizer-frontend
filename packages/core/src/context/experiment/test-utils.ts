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
  randomize = false,
  scoreValues: number[] | undefined = undefined
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
  const data = [...Array(count)].map((_id, idx) => ({
    meta: { enabled: true, id: idx + 1, valid: true },
    data: valueData.concat(categoricalData, scoreData),
  }))
  if (scoreValues !== undefined) {
    return data.map((dp, i) => ({
      ...dp,
      data: dp.data.map(d => {
        if (d.type === 'score' && d.name === 'score') {
          const score = scoreValues[i]
          return {
            ...d,
            value: score !== undefined ? score : 0,
          }
        }
        return d
      }),
    }))
  }
  return data
}
