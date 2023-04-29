import {
  DefaultApi,
  OptimizerapiOptimizerRunRequest,
} from '@boostv/process-optimizer-frontend-api'
import {
  ExperimentType,
  calculateData,
  calculateSpace,
  experimentResultSchema,
} from '@core/common'

export const createFetchExperimentResultRequest = (
  experiment: ExperimentType
) => {
  const cfg = experiment.optimizerConfig
  const extras = experiment.extras || {}
  const space = calculateSpace(experiment)

  const request: OptimizerapiOptimizerRunRequest = {
    experiment: {
      data: calculateData(
        experiment.categoricalVariables,
        experiment.valueVariables,
        experiment.scoreVariables,
        experiment.dataPoints
      ),
      extras: extras,
      optimizerConfig: {
        acqFunc: cfg.acqFunc,
        baseEstimator: cfg.baseEstimator,
        initialPoints: Number(cfg.initialPoints),
        kappa: Number(cfg.kappa),
        xi: Number(cfg.xi),
        space: space,
        constraints: experiment.constraints.map(c => ({
          type: c.type,
          value: c.value,
          dimensions: c.dimensions.map(d =>
            experiment.valueVariables.findIndex(v => d === v.name)
          ),
        })),
      },
    },
  }
  return request
}

export const fetchExperimentResult = async (
  experiment: ExperimentType,
  api: DefaultApi
) => {
  const request = createFetchExperimentResultRequest(experiment)
  const result = await api.optimizerapiOptimizerRun(request)

  return experimentResultSchema.parse({
    id: experiment.id,
    plots:
      result.plots?.map(p => ({ id: p.id ?? '', plot: p.plot ?? '' })) ?? [],
    next: result.result?.next ?? [],
    pickled: result.result?.pickled ?? '',
    expectedMinimum:
      result.result?.models?.find(() => true)?.expectedMinimum ?? [],
    extras: result.result?.extras ?? {},
  })
}
