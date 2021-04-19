import { ExperimentType } from "./types/common";

export const emptyExperiment: ExperimentType = {
  id: "",
  info: {
    name: "",
    description: "",
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
    rawResult: ""
  }
}

export type State = {
  experiment: ExperimentType
}

export const initialState: State = {
  experiment: emptyExperiment
}