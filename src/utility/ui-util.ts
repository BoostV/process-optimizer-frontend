import { GridSize } from '@mui/material'
import { State, UISizeKey, UISizeValue } from '../reducers/global-reducer'

export const isUIBig = (globalState: State, key: UISizeKey): boolean => {
  return globalState.uiSizes.find(u => u.key === key)?.value === UISizeValue.Big
}

export const isUISmall = (globalState: State, key: UISizeKey): boolean => {
  return (
    globalState.uiSizes.find(u => u.key === key)?.value === UISizeValue.Small
  )
}

export const getSize = (globalState: State, key: UISizeKey): GridSize => {
  const size = globalState.uiSizes.find(s => s.key === key)
  return (size !== undefined ? size.value : UISizeValue.Small) as GridSize
}
