import { ExperimentType } from "./types/common";

export const emptyExperiment: ExperimentType = {
  id: "",
  info: {
    name: "",
    description: "",
  },
  categoricalVariables: [],
  valueVariables: [],
}

export type State = {
  experiment: ExperimentType
}

export const initialState: State = {
  experiment: emptyExperiment
}