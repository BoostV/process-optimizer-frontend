import { versionInfo } from '@core/common'
import { currentVersion, scoreLabels, scoreNames } from '@core/common/types'
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
    lastModified: '',
    extras: {},
  },
  categoricalVariables: [],
  valueVariables: [],
  scoreVariables: [
    {
      name: scoreNames[0],
      label: scoreLabels[0] ?? scoreNames[0],
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
        name: scoreNames[0],
        label: scoreLabels[0] ?? scoreNames[0],
        description: '',
        enabled: true,
      },
      {
        name: scoreNames[1],
        label: scoreLabels[1] ?? scoreNames[1],
        description: '',
        enabled: true,
      },
    ],
  },
}
