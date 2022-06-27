import * as React from 'react'
import { versionInfo } from '../components/version-info'
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer'
import {
  Configuration,
  DefaultApi,
  OptimizerapiOptimizerRunRequest,
} from '../../openapi'
import { Dispatch, rootReducer } from '../reducers/reducers'
import { initialState, State } from '../store'
import { ExperimentResultType, ExperimentType } from '../types/common'
import { calculateData, calculateSpace } from '../utility/converters'
import { migrate } from '../utility/migration/migration'
import { useGlobal } from './global-context'

const ExperimentContext = React.createContext<
  { state: State; dispatch: Dispatch; loading: boolean } | undefined
>(undefined)

type ExperimentProviderProps = {
  experimentId: string
  children: any
}

function ExperimentProvider({
  experimentId,
  children,
}: ExperimentProviderProps) {
  const storageKey = experimentId === undefined ? 'unknown' : experimentId
  const initialExperimentState = {
    ...initialState,
    experiment: { ...initialState.experiment, id: experimentId },
  }
  const [state, dispatch] = useLocalStorageReducer(
    rootReducer,
    initialExperimentState,
    storageKey,
    (a: State) => ({ ...a, experiment: migrate(a.experiment) })
  )
  const [loading, setLoading] = React.useState(true)
  const { dispatch: globalDispatch } = useGlobal()

  React.useEffect(() => {
    ;(async () => {
      if (state?.experiment?.info?.swVersion !== versionInfo.version) {
        dispatch({ type: 'setSwVersion', payload: versionInfo.version })
      }
      globalDispatch({
        type: 'storeExperimentId',
        payload: experimentId,
      })
      setLoading(false)
    })()
  }, [dispatch, experimentId, state, globalDispatch])

  const getValue = (callback: (state: State) => any) => callback(state)

  const value = { state, dispatch, getValue, loading }
  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  )
}

function useExperiment() {
  const context = React.useContext(ExperimentContext)
  if (context === undefined) {
    throw new Error('useExperiment must be used within an ExperimentProvider')
  }
  return context
}

const fetchExperimentResult = async (
  experiment: ExperimentType
): Promise<ExperimentResultType> => {
  const API_SERVER = process.env.NEXT_PUBLIC_API_SERVER
  const api = new DefaultApi(new Configuration({ basePath: API_SERVER }))
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
      },
    },
  }

  const result = await api.optimizerapiOptimizerRun(request)

  const experimentResult: ExperimentResultType = {
    id: experiment.id,
    plots:
      result.plots?.map(p => ({ id: p.id ?? '', plot: p.plot ?? '' })) ?? [],
    next: result.result?.next ?? [],
    pickled: result.result?.pickled ?? '',
    expectedMinimum: result.result?.models?.find(() => true)
      ?.expectedMinimum ?? [[]],
    extras: result.result?.extras ?? {},
  }

  return experimentResult
}

async function runExperiment(dispatch: Dispatch, experiment: ExperimentType) {
  const result = await fetchExperimentResult(experiment)
  dispatch({ type: 'registerResult', payload: result })
}

export { ExperimentProvider, useExperiment, runExperiment }
