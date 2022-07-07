import { State } from '../store'

export const selectExperiment = (state: State) => state.experiment
export const selectId = (state: State) => selectExperiment(state).id

export const selectIsInitializing = (state: State) =>
  selectExperiment(state).optimizerConfig.initialPoints === 0 ||
  selectExperiment(state).dataPoints.length <
    selectExperiment(state).optimizerConfig.initialPoints
