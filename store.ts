import { ExperimentType } from "./types/common";
import { versionInfo } from './components/versioninfo'

export const emptyExperiment: ExperimentType = {
  id: "",
  info: {
    name: "",
    description: "",
    swVersion: versionInfo.version
  },
  categoricalVariables: [],
  valueVariables: [],
  optimizerConfig: {
    baseEstimator: "GP",
    acqFunc: "gp_hedge",
    initialPoints: 3,
    kappa: 1.96,
    xi: 0.01,
  },
  results: {
    id: "",
    next: [],
    plots: [],
    pickled: ""
  },
  dataPoints: []
}

export type State = {
  experiment: ExperimentType
}

export const initialState: State = {
  experiment: emptyExperiment
}