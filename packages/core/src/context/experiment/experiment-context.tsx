import * as React from 'react'
import { useLocalStorageReducer } from '@core/storage'
import {
  DefaultApi,
  OptimizerapiOptimizerRunRequest,
} from '@boostv/process-optimizer-frontend-api'
import { Dispatch, rootReducer } from './reducers'
import { calculateData, calculateSpace } from '@core/common/'
import { migrate } from '@core/common'
import { initialState, State, useApi } from '@core/context/experiment'
import { ExperimentResultType, ExperimentType } from '@core/common/types'
import { versionInfo } from '@core/common'

const ExperimentContext = React.createContext<
  | {
      state: State
      dispatch: Dispatch
      loading: boolean
      evaluate: (exp?: ExperimentType) => Promise<void>
    }
  | undefined
>(undefined)

type ExperimentProviderProps = {
  experimentId: string
  children?: React.ReactNode
  storage?: Storage
}

export function ExperimentProvider({
  experimentId,
  children,
  storage,
}: ExperimentProviderProps) {
  const api = useApi()
  const storageKey = experimentId === undefined ? 'unknown' : experimentId
  const initialExperimentState = {
    ...initialState,
    experiment: { ...initialState.experiment, id: experimentId },
  }
  const [state, dispatch] = useLocalStorageReducer(
    rootReducer,
    initialExperimentState,
    storageKey,
    (a: State) => ({ ...a, experiment: migrate(a.experiment) }),
    storage
  )
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (state?.experiment?.info?.swVersion !== versionInfo.version) {
      dispatch({ type: 'setSwVersion', payload: versionInfo.version })
    }
    setLoading(false)
  }, [dispatch, experimentId, state])

  const getValue = (callback: (state: State) => any) => callback(state)

  const value = {
    state,
    dispatch,
    getValue,
    loading,
    evaluate: async (exp?: ExperimentType) => {
      if (!loading) {
        setLoading(true)
        try {
          await runExperiment(dispatch, exp ?? state.experiment, api)
        } catch (e) {
          setLoading(false)
          throw e
        }
        setLoading(false)
      }
    },
  }
  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  )
}

export function useExperiment() {
  const context = React.useContext(ExperimentContext)
  if (context === undefined) {
    throw new Error('useExperiment must be used within an ExperimentProvider')
  }
  return context
}

export const useSelector = <T,>(selector: (state: State) => T) => {
  const context = React.useContext(ExperimentContext)
  if (context === undefined) {
    throw new Error('useSelector must be used within an ExperimentProvider')
  }
  return selector(context.state)
}

const fetchExperimentResult = async (
  experiment: ExperimentType,
  api: DefaultApi
): Promise<ExperimentResultType> => {
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
    // TODO: Remove cast, use zod
    next: (result.result?.next ?? []) as (string | number)[][],
    pickled: result.result?.pickled ?? '',
    expectedMinimum:
      result.result?.models?.find(() => true)?.expectedMinimum ?? [],
    extras: result.result?.extras ?? {},
  }

  return experimentResult
}

async function runExperiment(
  dispatch: Dispatch,
  experiment: ExperimentType,
  api: DefaultApi
) {
  const result = await fetchExperimentResult(experiment, api)
  dispatch({ type: 'registerResult', payload: result })
}
