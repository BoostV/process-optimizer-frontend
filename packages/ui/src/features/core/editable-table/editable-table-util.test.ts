import { getRowIndex, getRowId } from './editable-table-util'

describe('editable-table-util', () => {
  describe('getRowId', () => {
    it('should return correct id', async () => {
      expect(getRowId(true, 10, 20)).toBe(10)
      expect(getRowId(false, 10, 20)).toBe(11)
    })
  })
  describe('getRowIndex', () => {
    it('should return correct index', async () => {
      expect(getRowIndex(true, 8, 12)).toBe(3)
      expect(getRowIndex(false, 8, 12)).toBe(8)
    })
  })
})
