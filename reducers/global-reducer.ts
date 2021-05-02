export type State = {
    useLocalStorage: boolean
}

export type Action = {
    type: 'useLocalStorage'
    payload: boolean
}

export type Dispatch = (action: Action) => void

export const initialState: State = {
    useLocalStorage: false
}

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'useLocalStorage':
            return {...state, useLocalStorage: action.payload}
        default:
            return state
    }
}