import {
  CategoricalVariableType,
  DataEntry,
  DataPointType,
  ExperimentResultType,
  ScoreVariableType,
  ValueVariableType,
} from '@core/common'
import { ExperimentAction } from './experiment-reducers'
import { initialState } from './store'

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

type Payloads = {
  [key in ExperimentAction['type']]: key extends 'experiment/toggleMultiObjective'
    ? undefined
    : Extract<
        Exclude<ExperimentAction, { type: 'experiment/toggleMultiObjective' }>,
        { type: key }
      >['payload']
}

/**
 * An object containing a dummy payload for all experiment actions.
 * If new action types are added, the type checker should cause a compile time
 * error indicating that the type should be added to this object.
 */
export const dummyPayloads: Payloads = {
  setSwVersion: '123',
  registerResult: {
    id: 'myExperiment',
    next: [[1, 2, 3, 'Red']],
    pickled: 'pickled',
    expectedMinimum: [],
    extras: {},
    plots: [{ id: 'sample', plot: 'base64encodedData' }],
  } satisfies ExperimentResultType,
  addCategorialVariable: createCategoricalVariable({}),
  editCategoricalVariable: {
    index: 0,
    newVariable: createCategoricalVariable({}),
  },
  setCategoricalVariableEnabled: { index: 0, enabled: true },
  deleteCategorialVariable: 0,
  addValueVariable: createValueVariable({}),
  editValueVariable: {
    index: 0,
    newVariable: createValueVariable({}),
  },
  setValueVariableEnabled: { index: 0, enabled: true },
  deleteValueVariable: 0,
  updateExperiment: initialState.experiment,
  updateExperimentName: '',
  updateExperimentDescription: '',
  updateConfiguration: initialState.experiment.optimizerConfig,
  updateDataPoints: initialState.experiment.dataPoints,
  updateSuggestionCount: {
    suggestionCount: '',
  },
  copySuggestedToDataPoints: [],
  'experiment/toggleMultiObjective': undefined,
  'experiment/setConstraintSum': 0,
  'experiment/addVariableToConstraintSum': '',
  'experiment/removeVariableFromConstraintSum': '',
}
