import { UISize, UISizeValue } from '@sample/context/global'
import { getSize, isUIBig, isUISmall } from './ui-util'

const uiSizes: UISize[] = [
  { key: 'result-data', value: UISizeValue.Big },
  { key: 'plots', value: UISizeValue.Small },
]

describe('ui-util', () => {
  describe('isUIBig', () => {
    it('should return true when UI value is big', async () => {
      expect(isUIBig(uiSizes, 'result-data')).toBeTruthy()
    })
    it('should return false when UI value is small', async () => {
      expect(isUIBig(uiSizes, 'plots')).toBeFalsy()
    })
  })

  describe('isUISmall', () => {
    it('should return true when UI value is small', async () => {
      expect(isUISmall(uiSizes, 'plots')).toBeTruthy()
    })
    it('should return false when UI value is big', async () => {
      expect(isUISmall(uiSizes, 'result-data')).toBeFalsy()
    })
  })

  describe('getSize', () => {
    it('should return correct size when key exists', async () => {
      expect(getSize(uiSizes, 'result-data')).toBe(UISizeValue.Big)
    })
    it('should return small size when size when key does not exist', async () => {
      expect(getSize([], 'plots')).toBe(UISizeValue.Small)
    })
  })
})
