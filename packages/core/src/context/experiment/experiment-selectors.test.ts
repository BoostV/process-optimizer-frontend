import { initialState, State } from '@core/context/experiment/store'
import {
  selectId,
  selectIsInitializing,
  selectIsMultiObjective,
} from './experiment-selectors'
import { rootReducer } from './reducers'

describe('Experiment selectors', () => {
  let state: State
  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialState))
  })

  it('should select ID', () => {
    state.experiment.id = '123'
    expect(selectId(state)).toEqual('123')
  })

  describe('selectIsInitializing', () => {
    it('should return true if dataPoints.length < number of points', () => {
      state.experiment.dataPoints = []
      state.experiment.optimizerConfig.initialPoints = 3
      expect(selectIsInitializing(state)).toBeTruthy()
    })

    it('should return true if number of points is zero', () => {
      state.experiment.optimizerConfig.initialPoints = 0
      expect(selectIsInitializing(state)).toBeTruthy()
    })

    it('should return false if dataPoints.length >= number of points', () => {
      state.experiment.dataPoints = [
        { data: [], meta: { enabled: true, id: 1, valid: true } },
        { data: [], meta: { enabled: true, id: 2, valid: true } },
        { data: [], meta: { enabled: true, id: 3, valid: true } },
      ]
      state.experiment.optimizerConfig.initialPoints = 3
      expect(selectIsInitializing(state)).toBeFalsy()
    })
  })

  describe('selectIsMultiObjective', () => {
    it('should return false for initial ', () => {
      expect(selectIsMultiObjective(initialState)).toEqual(false)
    })

    it('should change value after toggle ', () => {
      const before = selectIsMultiObjective(initialState)
      const toggledOnceState = rootReducer(state, {
        type: 'experiment/toggleMultiObjective',
      })
      const after1stToggle = selectIsMultiObjective(toggledOnceState)
      const toggledTwiceState = rootReducer(toggledOnceState, {
        type: 'experiment/toggleMultiObjective',
      })
      const after2ndToggle = selectIsMultiObjective(toggledTwiceState)
      expect(after1stToggle).toEqual(!before)
      expect(after2ndToggle).toEqual(before)
    })
  })
})
