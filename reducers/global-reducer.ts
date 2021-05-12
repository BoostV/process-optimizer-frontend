import { ThemeName } from "../theme/theme"

export type State = {
    useLocalStorage: boolean
    debug: boolean
    experimentsInLocalStorage: string[]
    theme: ThemeName
}

export type Action = {
    type: 'useLocalStorage'
    payload: boolean
}
| { 
    type: 'debug'
    payload: boolean
}
| { 
    type: 'storeExperimentId'
    payload: string
}
| { 
    type: 'deleteExperimentId'
    payload: string
}
| {
    type: 'setTheme'
    payload: ThemeName
}

export type Dispatch = (action: Action) => void

export const initialState: State = {
    useLocalStorage: true,
    debug: false,
    experimentsInLocalStorage: [],
    theme: "BlueGreen"
}

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'debug':
            return {...state, debug: action.payload}
        case 'useLocalStorage':
            return {...state, useLocalStorage: action.payload}
        case 'storeExperimentId':
            const id: string = action.payload
            const storedIds: string[] = state.experimentsInLocalStorage
            if (storedIds.indexOf(id) === -1) {
                let idsAfterAdd: string[] = storedIds.slice()
                idsAfterAdd.splice(storedIds.length, 0, id)    
                return {...state, experimentsInLocalStorage: idsAfterAdd}
            } else {
                return state
            }
        case 'deleteExperimentId':
            let idsAfterDelete: string[] = state.experimentsInLocalStorage.slice()
            let indexOfDelete = state.experimentsInLocalStorage.indexOf(action.payload)
            idsAfterDelete.splice(indexOfDelete, 1)
            return {...state, experimentsInLocalStorage: idsAfterDelete }
        case 'setTheme':
            return { ...state, theme: action.payload }
        default:
            return state
    }
}