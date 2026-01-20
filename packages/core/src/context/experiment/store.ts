import { versionInfo } from '@core/common'
import { currentVersion, scoreLabels, scoreName } from '@core/common/types'
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
    extras: {},
  },
  categoricalVariables: [],
  valueVariables: [],
  scoreVariables: [
    {
      name: scoreName,
      label: scoreLabels[0],
      description: '',
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

export const initialStateMultiObjective: State = {
  experiment: {
    ...emptyExperiment,
    scoreVariables: [
      {
        name: scoreName,
        label: scoreLabels[0],
        description: '',
        enabled: true,
      },
      {
        name: scoreName + ' 2',
        label: scoreLabels[1],
        description: '',
        enabled: true,
      },
    ],
  },
}
