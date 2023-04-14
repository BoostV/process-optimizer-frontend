import { initialState, State } from '@core/context/experiment/store'
import { selectId, selectIsInitializing } from './experiment-selectors'

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
})
