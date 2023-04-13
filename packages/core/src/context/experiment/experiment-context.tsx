import * as React from 'react'
import { useLocalStorageReducer } from '@core/storage'
import { DefaultApi } from '@boostv/process-optimizer-frontend-api'
import { Dispatch, rootReducer } from './reducers'
import { migrate } from '@core/common'
import { initialState, State, useApi } from '@core/context/experiment'
import { ExperimentType } from '@core/common/types'
import { fetchExperimentResult } from '@core/context/experiment/api'

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

export const ExperimentProvider = ({
  experimentId,
  children,
  storage,
}: ExperimentProviderProps) => {
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
  return (
    <ManagedExperimentProvider state={state} dispatch={dispatch}>
      {children}
    </ManagedExperimentProvider>
  )
}

export type ManagedExperimentProviderProps = {
  state: State
  dispatch: Dispatch
  children: React.ReactNode
}

export function ManagedExperimentProvider({
  state,
  dispatch,
  children,
}: ManagedExperimentProviderProps) {
  const api = useApi()

  const [loading, setLoading] = React.useState(false)

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

async function runExperiment(
  dispatch: Dispatch,
  experiment: ExperimentType,
  api: DefaultApi
) {
  const result = await fetchExperimentResult(experiment, api)
  dispatch({ type: 'registerResult', payload: result })
}
