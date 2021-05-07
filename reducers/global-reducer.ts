export type State = {
    useLocalStorage: boolean
    debug: boolean
    experimentsInLocalStorage: string[]
}

export type Action = {
    type: 'useLocalStorage'
    payload: boolean
}
| { 
    type:'debug'
    payload: boolean
}
| { 
    type:'storeExperimentId'
    payload: string
}

export type Dispatch = (action: Action) => void

export const initialState: State = {
    useLocalStorage: false,
    debug: false,
    experimentsInLocalStorage: [],
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
        default:
            return state
    }
}