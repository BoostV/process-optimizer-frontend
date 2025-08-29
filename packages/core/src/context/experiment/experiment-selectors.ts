import { CombinedVariableType, ExperimentType } from 'common'
import { State } from './store'

// TODO: Test changes

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
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (experiment.results.next as unknown as any[][])
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

export const selectActiveVariablesFromExperiment = (
  experiment: ExperimentType
) => {
  const valueVars: CombinedVariableType[] = experiment.valueVariables
    .filter(v => v.enabled)
    .map(v => ({
      name: v.name,
      description: v.description,
      type: 'numeric',
    }))
  const catVars: CombinedVariableType[] = experiment.categoricalVariables
    .filter(v => v.enabled)
    .map(v => ({
      name: v.name,
      description: v.description,
      type: 'options',
      options: v.options,
    }))
  return valueVars.concat(catVars)
}

export const selectSumConstraint = (state: State) =>
  selectSumConstraintFromExperiment(selectExperiment(state))

export const selectSumConstraintFromExperiment = (experiment: ExperimentType) =>
  experiment.constraints.find(c => c.type === 'sum')

export const selectIsConstraintActive = (experiment: ExperimentType) =>
  (selectSumConstraintFromExperiment(experiment)?.dimensions.length ?? 0) > 1

export const selectInitialPoints = (state: State) =>
  selectInitialPointsFromExperiment(selectExperiment(state))

export const selectMaxEnabledVariablesBeforeSuggestionLimitation = (
  state: State
) =>
  selectMaxEnabledVariablesBeforeSuggestionLimitationFromExperiment(
    selectExperiment(state)
  )

export const selectInitialPointsFromExperiment = (experiment: ExperimentType) =>
  experiment.optimizerConfig.initialPoints

export const selectIsSuggestionCountEditable = (state: State) => {
  const dataPoints = selectActiveDataPoints(state)
  const initialPoints = selectInitialPoints(state)
  const numberOfActiveVariables = selectActiveVariableNames(state).length
  const maxEnabledVariablesBeforeSuggestionLimitation =
    selectMaxEnabledVariablesBeforeSuggestionLimitation(state)

  console.log({
    dataPoints,
    initialPoints,
    numberOfActiveVariables,
    maxEnabledVariablesBeforeSuggestionLimitation,
    isConstraintActive: selectIsConstraintActive(selectExperiment(state)),
  })

  return (
    (dataPoints.length < initialPoints ||
      !selectIsConstraintActive(selectExperiment(state))) &&
    (maxEnabledVariablesBeforeSuggestionLimitation === undefined ||
      numberOfActiveVariables <= maxEnabledVariablesBeforeSuggestionLimitation)
  )
}

export const selectSuggestionCountFromExperiment = (
  experiment: ExperimentType
) =>
  Number.isInteger(experiment.extras['experimentSuggestionCount'])
    ? Number(experiment.extras['experimentSuggestionCount'])
    : 1

export const selectCalculatedSuggestionCount = (state: State) =>
  selectCalculatedSuggestionCountFromExperiment(selectExperiment(state))

export const selectMaxEnabledVariablesBeforeSuggestionLimitationFromExperiment =
  (experiment: ExperimentType) =>
    experiment.optimizerConfig.maxEnabledVariablesBeforeSuggestionLimitation

export const selectCalculatedSuggestionCountFromExperiment = (
  experiment: ExperimentType
) => {
  const dataPoints = selectActiveDataPointsFromExperiment(experiment).length
  const initialPoints = selectInitialPointsFromExperiment(experiment)
  const activeVariables = selectActiveVariablesFromExperiment(experiment).length
  const maxEnabledVariablesBeforeSuggestionLimitation =
    selectMaxEnabledVariablesBeforeSuggestionLimitationFromExperiment(
      experiment
    )

  const isSuggestionsLimited =
    activeVariables > maxEnabledVariablesBeforeSuggestionLimitation

  if (dataPoints < initialPoints) {
    return initialPoints
  } else if (selectIsConstraintActive(experiment)) {
    return 1
  } else if (isSuggestionsLimited) {
    return 1
  }
  return selectSuggestionCountFromExperiment(experiment)
}
