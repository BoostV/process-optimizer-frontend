import { beforeEach, describe, expect, it } from 'vitest'
import { initialState, State } from '@sample/context/global'
import { selectDebug, selectAdvancedConfiguration } from './global-selectors'

describe('Experiment selectors', () => {
  let state: State
  beforeEach(() => {
    state = JSON.parse(JSON.stringify(initialState))
  })

  it('should select debug', () => {
    state.debug = true
    expect(selectDebug(state)).toBeTruthy()
  })

  describe('Flags', () => {
    it('should selectAdvancedConfiguration', () => {
      state.flags.advancedConfiguration = true
      expect(selectAdvancedConfiguration(state)).toBeTruthy()
    })
  })
})
