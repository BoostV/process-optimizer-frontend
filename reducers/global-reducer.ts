export type State = {
    useLocalStorage: boolean
    debug: boolean
}

export type Action = {
    type: 'useLocalStorage'
    payload: boolean
}
| { 
    type:'debug'
    payload: boolean
}

export type Dispatch = (action: Action) => void

export const initialState: State = {
    useLocalStorage: false,
    debug: false
}

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'debug':
            return {...state, debug: action.payload}
        case 'useLocalStorage':
            return {...state, useLocalStorage: action.payload}
        default:
            return state
    }
}