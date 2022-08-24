import { GridSize } from '@mui/material'
import { UISize, UISizeKey, UISizeValue } from '@/context/global'

export const isUIBig = (uiSizes: UISize[], key: UISizeKey): boolean => {
  return uiSizes.find(u => u.key === key)?.value === UISizeValue.Big
}

export const isUISmall = (uiSizes: UISize[], key: UISizeKey): boolean => {
  return uiSizes.find(u => u.key === key)?.value === UISizeValue.Small
}

export const getSize = (uiSizes: UISize[], key: UISizeKey): GridSize => {
  const size = uiSizes.find(s => s.key === key)
  return (size !== undefined ? size.value : UISizeValue.Small) as GridSize
}
