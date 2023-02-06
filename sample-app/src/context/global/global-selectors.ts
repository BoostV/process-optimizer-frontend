import { State } from '@sample/context/global'

export const selectDebug = (state: State) => state.debug

export const selectFlags = (state: State) => state.flags

export const selectAdvancedConfiguration = (state: State) =>
  selectFlags(state).advancedConfiguration
