import { ThemeName } from '../theme/theme'
import { initialState, reducer, State, UISizeValue } from './global-reducer'

const initState = initialState

describe('storeExperimentId', () => {
  it('should store id', async () => {
    const payload = '1234'
    expect(reducer(initState, { type: 'storeExperimentId', payload })).toEqual({
      ...initState,
      experimentsInLocalStorage: [payload],
    })
  })

  it('should not duplicate id if already stored', async () => {
    const payload = '1234'
    expect(
      reducer(
        { ...initState, experimentsInLocalStorage: [payload] },
        { type: 'storeExperimentId', payload }
      )
    ).toEqual({ ...initState, experimentsInLocalStorage: [payload] })
  })
})

describe('deleteExperimentId', () => {
  it('should delete id', async () => {
    expect(
      reducer(
        { ...initState, experimentsInLocalStorage: ['1234', '5678'] },
        { type: 'deleteExperimentId', payload: '1234' }
      )
    ).toEqual({ ...initState, experimentsInLocalStorage: ['5678'] })
  })
  it('should return empty array when no ids to delete', async () => {
    expect(
      reducer(initState, { type: 'deleteExperimentId', payload: '1234' })
    ).toEqual(initState)
  })
})

describe('setTheme', () => {
  it('should set theme', async () => {
    const payload: ThemeName = 'Bee'
    expect(reducer(initState, { type: 'setTheme', payload })).toEqual({
      ...initState,
      theme: payload,
    })
  })
})

describe('setDataPointsNewestFirst', () => {
  it('should toggle data points newest first', async () => {
    const payload = true
    expect(
      reducer(initState, { type: 'setDataPointsNewestFirst', payload })
    ).toEqual({ ...initState, dataPointsNewestFirst: payload })
  })
})

describe('setShowJsonEditor', () => {
  it('should toggle json editor', async () => {
    const payload = true
    expect(reducer(initState, { type: 'setShowJsonEditor', payload })).toEqual({
      ...initState,
      showJsonEditor: payload,
    })
  })
})

describe('toggleUISize', () => {
  it('should add ui size if not present', async () => {
    const payload = 'result-data'
    const expectedState: State = {
      ...initState,
      uiSizes: [
        ...initState.uiSizes.concat({ key: payload, value: UISizeValue.Big }),
      ],
    }
    expect(reducer(initState, { type: 'toggleUISize', payload })).toEqual(
      expectedState
    )
  })
})

describe('toggleUISize', () => {
  it('should toggle ui size if already present', async () => {
    const payload = 'plots'
    const expectedState: State = {
      ...initState,
      uiSizes: [{ key: payload, value: UISizeValue.Small }],
    }
    const testState: State = {
      ...initState,
      uiSizes: [{ key: 'plots', value: 12 }],
    }
    expect(reducer(testState, { type: 'toggleUISize', payload })).toEqual(
      expectedState
    )
  })
})

describe('toggleAdvancedConfiguration', () => {
  it('should toggle advanced configuration flag', () => {
    let state = reducer(initState, {
      type: 'global/toggleAdvancedConfiguration',
    })
    expect(state.flags.advancedConfiguration).toBeTruthy()

    state = reducer(state, {
      type: 'global/toggleAdvancedConfiguration',
    })
    expect(state.flags.advancedConfiguration).toBeFalsy()
  })
})
