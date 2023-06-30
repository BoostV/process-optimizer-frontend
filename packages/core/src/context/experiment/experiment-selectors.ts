import { ExperimentType } from 'common'
import { State } from './store'

export const selectExperiment = (state: State) => state.experiment
export const selectId = (state: State) => selectExperiment(state).id

export const selectIsInitializing = (state: State) =>
  selectExperiment(state).optimizerConfig.initialPoints === 0 ||
  selectExperiment(state).dataPoints.length <
    selectExperiment(state).optimizerConfig.initialPoints

export const selectDataPoints = (state: State) =>
  selectExperiment(state).dataPoints

export const selectActiveDataPoints = (state: State) =>
  selectExperiment(state).dataPoints.filter(d => d.meta.valid && d.meta.enabled)

export const selectExpectedMinimum = (state: State) =>
  selectExperiment(state).results.expectedMinimum

export const selectIsMultiObjective = (state: State) =>
  selectExperiment(state).scoreVariables.filter(it => it.enabled).length > 1

export const selectNextValues = (experiment: ExperimentType) => {
  return experiment.results.next && Array.isArray(experiment.results.next[0])
    ? (experiment.results.next as unknown as any[][])
    : experiment.results.next
    ? [experiment.results.next]
    : []
}

export const selectNextExperimentValues = (state: State) => {
  const experiment = selectExperiment(state)
  return selectNextValues(experiment)
}

export const selectVariableNames = (state: State): string[] => {
  const experiment = selectExperiment(state)
  return experiment.valueVariables
    .map(v => v.name)
    .concat(experiment.categoricalVariables.map(c => c.name))
}

export const selectActiveVariableNames = (state: State): string[] => {
  const experiment = selectExperiment(state)
  return experiment.valueVariables
    .filter(v => v.enabled)
    .map(v => v.name)
    .concat(
      experiment.categoricalVariables.filter(c => c.enabled).map(c => c.name)
    )
}
