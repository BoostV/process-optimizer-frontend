//TODO: Why do @ imports not work here but do in e.g. details.tsx?
import { versionInfo } from './../../features/core/version-info'
import { currentVersion, ExperimentType } from './../../common/types/common'

export const emptyExperiment: ExperimentType = {
  id: '',
  changedSinceLastEvaluation: false,
  info: {
    name: '',
    description: '',
    swVersion: versionInfo.version,
    dataFormatVersion: currentVersion,
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
