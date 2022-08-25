import { dataPointsReducer, DataPointsState } from './data-points-reducer'
import { TableDataRow } from '@/components/editable-table'

describe('data points reducer', () => {
  const initialState: DataPointsState = {
    changed: false,
    rows: [],
  }

  describe('dataPointsReducer - setInitialState', () => {
    it('should set initial state', async () => {
      const payload: DataPointsState = {
        changed: false,
        rows: [
          {
            isNew: false,
            dataPoints: [
              {
                name: 'test',
                value: '100',
              },
            ],
          },
        ],
      }
      expect(
        dataPointsReducer(
          { ...initialState },
          {
            type: 'setInitialState',
            payload,
          }
        )
      ).toEqual(payload)
    })
  })
  describe('dataPointsReducer - rowAdded', () => {
    it('should add a row and set changed to true', async () => {
      const payload: TableDataRow = {
        isNew: false,
        dataPoints: [
          {
            name: 'test',
            value: '100',
          },
        ],
      }
      expect(
        dataPointsReducer(
          { ...initialState },
          {
            type: 'rowAdded',
            payload,
          }
        )
      ).toEqual({
        ...initialState,
        rows: [...initialState.rows, payload],
        changed: true,
      })
    })
  })
  describe('dataPointsReducer - rowDeleted', () => {
    it('should delete a row and set changed to true', async () => {
      expect(
        dataPointsReducer(
          {
            ...initialState,
            rows: [
              {
                isNew: false,
                dataPoints: [
                  {
                    name: 'test1',
                    value: '100',
                  },
                ],
              },
              {
                isNew: false,
                dataPoints: [
                  {
                    name: 'test2',
                    value: '200',
                  },
                ],
              },
            ],
          },
          {
            type: 'rowDeleted',
            payload: 1,
          }
        )
      ).toEqual({
        ...initialState,
        rows: [
          {
            isNew: false,
            dataPoints: [
              {
                name: 'test1',
                value: '100',
              },
            ],
          },
        ],
        changed: true,
      })
    })
  })
  describe('dataPointsReducer - rowEdited', () => {
    it('should edit a row and set changed to true', async () => {
      const payload = {
        row: {
          isNew: false,
          dataPoints: [
            {
              name: 'testNew',
              value: '999',
            },
          ],
        },
        rowIndex: 0,
      }
      expect(
        dataPointsReducer(
          {
            ...initialState,
            rows: [
              {
                isNew: false,
                dataPoints: [
                  {
                    name: 'test1',
                    value: '100',
                  },
                ],
              },
            ],
          },
          {
            type: 'rowEdited',
            payload,
          }
        )
      ).toEqual({
        ...initialState,
        rows: [
          {
            isNew: false,
            dataPoints: [
              {
                name: payload.row.dataPoints[0]?.name,
                value: payload.row.dataPoints[0]?.value,
              },
            ],
          },
        ],
        changed: true,
      })
    })
  })
})
