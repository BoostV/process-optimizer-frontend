import { versionInfo } from '@core/common'
import { currentVersion } from '@core/common/types'
import { ExperimentType } from '@core/common/types'

export const emptyExperiment: ExperimentType = {
  id: '',
  lastEvaluationHash: '',
  changedSinceLastEvaluation: true,
  info: {
    name: '',
    description: '',
    swVersion: versionInfo.version,
    dataFormatVersion: currentVersion,
    version: 0,
  },
  categoricalVariables: [],
  valueVariables: [],
  scoreVariables: [
    {
      name: 'score',
      description: 'score',
      enabled: true,
    },
  ],
  constraints: [
    {
      type: 'sum',
      dimensions: [],
      value: 0,
    },
  ],
  optimizerConfig: {
    baseEstimator: 'GP',
    acqFunc: 'EI',
    initialPoints: 3,
    kappa: 1.96,
    xi: 0.01,
  },
  results: {
    id: '',
    next: [],
    plots: [],
    pickled: '',
    expectedMinimum: [],
    extras: {},
  },
  dataPoints: [],
  extras: {
    experimentSuggestionCount: 1,
  },
}

export type State = {
  experiment: ExperimentType
}

export const initialState: State = {
  experiment: emptyExperiment,
}
