import * as React from 'react'
import useSwr from 'swr'
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer'
import { Dispatch, rootReducer } from '../reducers/reducers'
import { initialState, State } from '../store'
import { ExperimentResultType, ExperimentType } from '../types/common'

const fetcher = async (url: string) => (await fetch(url)).json()

type ExperimentLoadResponse = {
    data?: ExperimentType
    error?: any
}

const ExperimentContext = React.createContext<
    { state: State, dispatch: Dispatch } | undefined
>(undefined)

type ExperimentProviderProps = {
    experimentId: string
    useLocalStorage: boolean
    children: any
}

function ExperimentProvider({ experimentId, useLocalStorage = false, children }: ExperimentProviderProps) {
    console.log(`Creating context ${experimentId} ${useLocalStorage}`)
    const storageKey = experimentId === undefined ? 'unknown' : experimentId
    const [state, dispatch] = useLocalStorage ? useLocalStorageReducer(rootReducer, initialState, storageKey) : React.useReducer(rootReducer, initialState)
    console.log(state.experiment.id)

    // const { data: experiment, error }: ExperimentLoadResponse = useSwr(`/api/experiment/${experimentId}`, fetcher,
    // {
    //     onSuccess: (data: ExperimentType) => {
    //         dispatch({
    //             type: 'updateExperiment',
    //             payload: data
    //         })
    //     },
    //     revalidateOnFocus: false,
    // });

    const getValue = (callback: (state: State) => any) => callback(state)

    const value = { state, dispatch, getValue }
    return <ExperimentContext.Provider value={value}>{children}</ExperimentContext.Provider>
}

function useExperiment() {
    const context = React.useContext(ExperimentContext)
    if (context === undefined) {
        throw new Error('useExperiment must be used within an ExperimentProvider')
    }
    return context
}

async function saveExperiment(experiment: ExperimentType) {
    return fetch(`/api/experiment/${experiment.id}`, { method: 'PUT', body: JSON.stringify(experiment) })
}

async function runExperiment(dispatch: Dispatch, experiment: ExperimentType) {
    const response: Response = await fetch(`/api/experiment/${experiment.id}`, { method: 'POST', body: JSON.stringify(experiment) })
    const result: ExperimentResultType = await response.json()
    dispatch({ type: 'registerResult', payload: result })
}

export { ExperimentProvider, useExperiment, saveExperiment, runExperiment }