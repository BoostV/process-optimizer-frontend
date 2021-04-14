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
    baseEstimater: "GP",
    acqFunc: "gp_hedge",
    initialPoints: 3,
    kappa: 1.96,
    xi: 0.01,
  }
}

export type State = {
  experiment: ExperimentType
}

export const initialState: State = {
  experiment: emptyExperiment
}