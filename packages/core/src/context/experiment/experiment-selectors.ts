import { ExperimentType } from 'common'
import { State } from './store'

export const selectExperiment = (state: State) => state.experiment
export const selectId = (state: State) => selectExperiment(state).id

export const selectIsInitializing = (state: State) =>
  selectExperiment(state).optimizerConfig.initialPoints === 0 ||
  selectActiveDataPoints(state).length <
    selectExperiment(state).optimizerConfig.initialPoints

export const selectDataPoints = (state: State) =>
  selectExperiment(state).dataPoints

export const selectActiveDataPoints = (state: State) =>
  selectActiveDataPointsFromExperiment(selectExperiment(state))

export const selectActiveDataPointsFromExperiment = (
  experiment: ExperimentType
) => experiment.dataPoints.filter(d => d.meta.valid && d.meta.enabled)

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

export const selectSumConstraint = (state: State) =>
  selectSumConstraintFromExperiment(selectExperiment(state))

export const selectSumConstraintFromExperiment = (experiment: ExperimentType) =>
  experiment.constraints.find(c => c.type === 'sum')

export const selectIsConstraintActive = (experiment: ExperimentType) =>
  (selectSumConstraintFromExperiment(experiment)?.dimensions.length ?? 0) > 1

export const selectInitialPoints = (state: State) =>
  selectInitialPointsFromExperiment(selectExperiment(state))

export const selectInitialPointsFromExperiment = (experiment: ExperimentType) =>
  experiment.optimizerConfig.initialPoints

export const selectIsSuggestionCountEditable = (state: State) => {
  const dataPoints = selectActiveDataPoints(state)
  const initialPoints = selectInitialPoints(state)
  return (
    dataPoints.length < initialPoints ||
    !selectIsConstraintActive(selectExperiment(state))
  )
}

export const selectSuggestionCountFromExperiment = (
  experiment: ExperimentType
) => experiment.extras['experimentSuggestionCount'] as number

export const selectCalculatedSuggestionCount = (state: State) =>
  selectCalculatedSuggestionCountFromExperiment(selectExperiment(state))

export const selectCalculatedSuggestionCountFromExperiment = (
  experiment: ExperimentType
) => {
  const dataPoints = selectActiveDataPointsFromExperiment(experiment).length
  const initialPoints = selectInitialPointsFromExperiment(experiment)

  if (dataPoints < initialPoints) {
    return initialPoints
  } else if (selectIsConstraintActive(experiment)) {
    return 1
  }
  return selectSuggestionCountFromExperiment(experiment)
}
