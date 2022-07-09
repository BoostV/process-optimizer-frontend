import { ThemeName } from '../../theme/theme'
import produce from 'immer'
import { assertUnreachable } from '@/utility'

export type State = {
  debug: boolean
  experimentsInLocalStorage: string[]
  theme: ThemeName
  dataPointsNewestFirst: boolean
  showJsonEditor: boolean
  uiSizes: UISize[]
  focus: 'configuration' | 'data-entry' | 'results' | 'legacy'
  flags: {
    advancedConfiguration: boolean
  }
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
  | {
      type: 'global/setFocus'
      payload: State['focus']
    }
  | { type: 'global/toggleAdvancedConfiguration' }
export type Dispatch = (action: Action) => void

export const initialState: State = {
  debug: false,
  experimentsInLocalStorage: [],
  theme: 'BlueGreen',
  dataPointsNewestFirst: false,
  showJsonEditor: false,
  uiSizes: [],
  focus: 'legacy',
  flags: {
    advancedConfiguration: false,
  },
}

export const reducer = produce((state: State, action: Action) => {
  switch (action.type) {
    case 'debug':
      state.debug = action.payload
      break
    case 'storeExperimentId':
      const id: string = action.payload
      if (state.experimentsInLocalStorage.indexOf(id) === -1) {
        state.experimentsInLocalStorage.splice(
          state.experimentsInLocalStorage.length,
          0,
          id
        )
      }
      break
    case 'deleteExperimentId':
      let indexOfDelete = state.experimentsInLocalStorage.indexOf(
        action.payload
      )
      state.experimentsInLocalStorage.splice(indexOfDelete, 1)
      break
    case 'setTheme':
      state.theme = action.payload
      break
    case 'setDataPointsNewestFirst':
      state.dataPointsNewestFirst = action.payload
      break
    case 'setShowJsonEditor':
      state.showJsonEditor = action.payload
      break
    case 'toggleUISize':
      const indexSize = state.uiSizes.findIndex(u => u.key === action.payload)
      if (indexSize === -1) {
        state.uiSizes.splice(state.uiSizes.length, 0, {
          key: action.payload,
          value: UISizeValue.Big,
        })
      } else {
        state.uiSizes = state.uiSizes.map(size => {
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
      break
    case 'global/setFocus':
      state.focus = action.payload
      break
    case 'global/toggleAdvancedConfiguration':
      state.flags.advancedConfiguration = !state.flags.advancedConfiguration
      break
    default:
      assertUnreachable(action)
  }
})
