import {
  dataPointsReducer,
  DataPointsState,
  DataPointsAction,
} from './data-points-reducer'
import { TableDataRow } from '../types/common'

describe('data points reducer', () => {
  const initialState: DataPointsState = {
    changed: false,
    rows: [],
  }

  describe('todo - tests', () => {
    it('should toggle edit mode and set row to prevRow', async () => {
      expect(true).toBe(true)
    })
  })
})
