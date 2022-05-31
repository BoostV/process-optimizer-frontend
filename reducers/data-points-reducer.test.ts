import {
  dataPointsReducer,
  DataPointsState,
  DataPointsTableAction,
} from './data-points-reducer'
import { TableDataRow } from '../types/common'

describe('data points reducer', () => {
  const initialState: DataPointsState = {
    changed: false,
    hasTempChange: false,
    rows: [],
    prevRows: [],
  }

  describe('DataPointsTableEditCancelledAction', () => {
    it('should toggle edit mode and set row to prevRow', async () => {
      const payload = 0

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDIT_CANCELLED',
        payload,
      }

      const initState: DataPointsState = {
        ...initialState,
        prevRows: [
          {
            dataPoints: [
              {
                name: 'Water',
                value: '100',
              },
            ],
            isEditMode: false,
            isNew: false,
          },
        ],
        rows: [
          {
            dataPoints: [
              {
                name: 'Water',
                value: '200',
              },
            ],
            isEditMode: true,
            isNew: false,
          },
        ],
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        prevRows: initState.prevRows,
        rows: initState.prevRows,
        changed: false,
        hasTempChange: false,
      })
    })

    it('should set row to prevRow but not toggle edit mode for new row', async () => {
      const payload = 0

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDIT_CANCELLED',
        payload,
      }

      const initState: DataPointsState = {
        ...initialState,
        prevRows: [
          {
            dataPoints: [
              {
                name: 'Water',
                value: '',
              },
            ],
            isEditMode: true,
            isNew: true,
          },
        ],
        rows: [
          {
            dataPoints: [
              {
                name: 'Water',
                value: '100',
              },
            ],
            isEditMode: true,
            isNew: true,
          },
        ],
      }
      expect(dataPointsReducer(initState, action)).toEqual({
        changed: false,
        hasTempChange: false,
        prevRows: initState.prevRows,
        rows: initState.prevRows,
      })
    })
  })

  describe('DataPointsTableEditedAction', () => {
    it('should edit table cell', async () => {
      const payload = {
        value: '300',
        rowIndex: 0,
        itemIndex: 1,
        useArrayForValue: 'score',
      }

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDITED',
        payload,
      }

      const initState: DataPointsState = {
        ...initialState,
        prevRows: [],
        rows: [
          {
            dataPoints: [
              {
                name: 'Water',
                value: '100',
              },
              {
                name: 'Milk',
                value: '200',
              },
              {
                name: 'score',
                value: '0.5',
              },
            ],
            isEditMode: true,
            isNew: false,
          },
        ],
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        ...initState,
        changed: false,
        hasTempChange: true,
        rows: [
          {
            ...initState.rows[0],
            dataPoints: [
              { ...initState.rows[0].dataPoints[0] },
              { ...initState.rows[0].dataPoints[1], value: payload.value },
              { ...initState.rows[0].dataPoints[2] },
            ],
          },
        ],
      })
    })
  })

  describe('DataPointsTableUpdatedAction', () => {
    it('should update table', async () => {
      const payload = [
        {
          dataPoints: [
            {
              name: 'Milk',
              value: '200',
            },
            {
              name: 'score',
              value: '0.3',
            },
          ],
          isEditMode: false,
          isNew: false,
        },
      ]

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_UPDATED',
        payload,
      }

      const initState: DataPointsState = {
        ...initialState,
        prevRows: [],
        rows: [
          {
            dataPoints: [
              {
                name: 'Water',
                value: '100',
              },
              {
                name: 'score',
                value: '0.1',
              },
            ],
            isEditMode: false,
            isNew: false,
          },
        ],
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        ...initialState,
        prevRows: [],
        rows: payload,
      })
    })
  })

  describe('DataPointsTableDeletedAction', () => {
    it('should delete row', async () => {
      const payload = 1

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_ROW_DELETED',
        payload,
      }

      const initRows: TableDataRow[] = [
        {
          dataPoints: [
            {
              name: 'Water',
              value: '100',
            },
            {
              name: 'score',
              value: '0.1',
            },
          ],
          isEditMode: false,
          isNew: false,
        },
        {
          dataPoints: [
            {
              name: 'Water',
              value: '200',
            },
            {
              name: 'score',
              value: '0.2',
            },
          ],
          isEditMode: false,
          isNew: false,
        },
      ]

      const initState: DataPointsState = {
        ...initialState,
        prevRows: initRows,
        rows: initRows,
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        ...initialState,
        prevRows: initState.prevRows.slice(0, 1),
        rows: initState.rows.slice(0, 1),
        changed: true,
        hasTempChange: false,
      })
    })
  })

  describe('DataPointsTableRowAddedAction', () => {
    it('should add row', async () => {
      const payload = {
        dataPoints: [
          {
            name: 'Milk',
            value: '',
          },
          {
            name: 'score',
            value: '0',
          },
        ],
        isEditMode: true,
        isNew: true,
      }

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_ROW_ADDED',
        payload,
      }

      const initRows: TableDataRow[] = [
        {
          dataPoints: [
            {
              name: 'Milk',
              value: '100',
            },
            {
              name: 'score',
              value: '0.1',
            },
          ],
          isEditMode: true,
          isNew: true,
        },
      ]

      const initState: DataPointsState = {
        ...initialState,
        prevRows: initRows,
        rows: initRows,
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        ...initialState,
        changed: true,
        hasTempChange: false,
        prevRows: [
          {
            ...initState.rows[0],
            isEditMode: false,
            isNew: false,
          },
          payload,
        ],
        rows: [
          {
            ...initState.rows[0],
            isEditMode: false,
            isNew: false,
          },
          payload,
        ],
      })
    })
  })

  describe('setInitialState', () => {
    it('should set state', async () => {
      const payload: DataPointsState = {
        changed: false,
        hasTempChange: false,
        rows: [
          {
            isNew: false,
            isEditMode: false,
            dataPoints: [
              {
                name: 'A',
                value: '1',
              },
            ],
          },
        ],
        prevRows: [
          {
            isNew: false,
            isEditMode: false,
            dataPoints: [
              {
                name: 'A',
                value: '1',
              },
            ],
          },
        ],
      }

      expect(
        dataPointsReducer(
          {
            changed: false,
            hasTempChange: false,
            rows: [],
            prevRows: [],
          },
          {
            type: 'setInitialState',
            payload,
          }
        )
      ).toEqual({ ...payload, changed: false })
    })
  })
})
