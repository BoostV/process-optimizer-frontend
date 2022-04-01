import { ThemeName } from '../theme/theme'

export type State = {
  debug: boolean
  experimentsInLocalStorage: string[]
  theme: ThemeName
  dataPointsNewestFirst: boolean
  showJsonEditor: boolean
  uiSizes: UISize[]
}

export enum UISizeValue {
  Small = 6,
  Big = 12,
}

export type UISizeKey = 'result-data' | 'plots'

export type UISize = {
  key: UISizeKey
  value: number
}

export type Action =
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
  | {
      type: 'setDataPointsNewestFirst'
      payload: boolean
    }
  | {
      type: 'setShowJsonEditor'
      payload: boolean
    }
  | {
      type: 'toggleUISize'
      payload: UISizeKey
    }
export type Dispatch = (action: Action) => void

export const initialState: State = {
  debug: false,
  experimentsInLocalStorage: [],
  theme: 'BlueGreen',
  dataPointsNewestFirst: false,
  showJsonEditor: false,
  uiSizes: [],
}

export const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'debug':
      return { ...state, debug: action.payload }
    case 'storeExperimentId':
      const id: string = action.payload
      const storedIds: string[] = state.experimentsInLocalStorage
      if (storedIds.indexOf(id) === -1) {
        let idsAfterAdd: string[] = storedIds.slice()
        idsAfterAdd.splice(storedIds.length, 0, id)
        return { ...state, experimentsInLocalStorage: idsAfterAdd }
      } else {
        return state
      }
    case 'deleteExperimentId':
      let idsAfterDelete: string[] = state.experimentsInLocalStorage.slice()
      let indexOfDelete = state.experimentsInLocalStorage.indexOf(
        action.payload
      )
      idsAfterDelete.splice(indexOfDelete, 1)
      return { ...state, experimentsInLocalStorage: idsAfterDelete }
    case 'setTheme':
      return { ...state, theme: action.payload }
    case 'setDataPointsNewestFirst':
      return { ...state, dataPointsNewestFirst: action.payload }
    case 'setShowJsonEditor':
      return { ...state, showJsonEditor: action.payload }
    case 'toggleUISize':
      const indexSize = state.uiSizes.findIndex(u => u.key === action.payload)
      let newSizes = state.uiSizes.slice()
      if (indexSize === -1) {
        newSizes.splice(state.uiSizes.length, 0, {
          key: action.payload,
          value: UISizeValue.Big,
        })
      } else {
        newSizes = state.uiSizes.map(size => {
          if (size.key !== action.payload) {
            return size
          }
          return {
            key: action.payload,
            value:
              size.value === UISizeValue.Big
                ? UISizeValue.Small
                : UISizeValue.Big,
          }
        })
      }
      return { ...state, uiSizes: newSizes }
    default:
      return state
  }
}
