import * as React from 'react'
import { versionInfo } from '../components/version-info'
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer'
import { Dispatch, rootReducer } from '../reducers/reducers'
import { initialState, State } from '../store'
import { ExperimentResultType, ExperimentType } from '../types/common'
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

function TestExperimentProvider({ value, children }) {
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

async function runExperiment(dispatch: Dispatch, experiment: ExperimentType) {
  const response: Response = await fetch(`/api/experiment/${experiment.id}`, {
    method: 'POST',
    body: JSON.stringify(experiment),
  })
  const result: ExperimentResultType = await response.json()
  dispatch({ type: 'registerResult', payload: result })
}

export {
  ExperimentProvider,
  TestExperimentProvider,
  useExperiment,
  runExperiment,
}
