import { CombinedVariableType, ExperimentType } from 'common'
import { calculateConstraints } from '@core/common'
import { State } from './store'

export const selectExperiment = (state: State) => state.experiment
export const selectId = (state: State) => selectExperiment(state).id

// Initializing = fewer SCORED (valid + enabled) points than initialPoints. Note
// this counts valid+enabled rows, whereas selectInitializationDeficit* counts
// merely enabled rows (an entered-but-unscored row still holds its slot) — the
// two denominators differ on purpose.
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

export const selectActiveScoreVariableLabels = (state: State): string[] => {
  const experiment = selectExperiment(state)
  return experiment.scoreVariables.filter(s => s.enabled).map(s => s.label)
}

export const selectActiveScoreVariableNames = (state: State): string[] => {
  const experiment = selectExperiment(state)
  return experiment.scoreVariables.filter(s => s.enabled).map(s => s.name)
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

export const selectPlotsFromExperiment = (experiment: ExperimentType) =>
  experiment.results.plots

export const selectPlots = (state: State) =>
  selectPlotsFromExperiment(selectExperiment(state))

export const selectSumConstraint = (state: State) =>
  selectSumConstraintFromExperiment(selectExperiment(state))

export const selectSumConstraintFromExperiment = (experiment: ExperimentType) =>
  experiment.constraints.find(c => c.type === 'sum')

// A sum constraint is "active" only if it survives into the optimizer request,
// i.e. its dimensions resolve to more than one enabled, continuous variable.
// We defer to calculateConstraints (the single source of truth for what is
// sent) rather than counting the raw stored dimension names. Counting raw names
// could desync the suggestion-count guard from the actual request — e.g. a
// degenerate sum constraint with zero/one dimensions, or names that no longer
// map to enabled continuous variables, would otherwise be treated as active
// here while contributing nothing to the request.
export const selectIsConstraintActive = (experiment: ExperimentType) =>
  calculateConstraints(experiment).some(c => c.type === 'sum')

export const selectInitialPoints = (state: State) =>
  selectInitialPointsFromExperiment(selectExperiment(state))

export const selectInitialPointsFromExperiment = (experiment: ExperimentType) =>
  experiment.optimizerConfig.initialPoints

// During initialization, how many more experiments are needed to reach
// initialPoints. A row "occupies a slot" if it is enabled (scored or not), so a
// disabled row counts as missing — disabling re-opens a slot just like deleting.
export const selectInitializationDeficitFromExperiment = (
  experiment: ExperimentType
) => {
  const enabledRows = experiment.dataPoints.filter(d => d.meta.enabled).length
  return Math.max(
    0,
    selectInitialPointsFromExperiment(experiment) - enabledRows
  )
}

export const selectInitializationDeficit = (state: State) =>
  selectInitializationDeficitFromExperiment(selectExperiment(state))

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
) =>
  Number.isInteger(experiment.extras['experimentSuggestionCount'])
    ? Number(experiment.extras['experimentSuggestionCount'])
    : 1

export const selectCalculatedSuggestionCount = (state: State) =>
  selectCalculatedSuggestionCountFromExperiment(selectExperiment(state))

export const selectCalculatedSuggestionCountFromExperiment = (
  experiment: ExperimentType
) => {
  const dataPoints = selectActiveDataPointsFromExperiment(experiment).length
  const initialPoints = selectInitialPointsFromExperiment(experiment)

  if (dataPoints < initialPoints) {
    return selectInitializationDeficitFromExperiment(experiment)
  } else if (selectIsConstraintActive(experiment)) {
    return 1
  }
  return selectSuggestionCountFromExperiment(experiment)
}
