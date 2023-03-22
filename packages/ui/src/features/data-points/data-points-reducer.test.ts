import { dataPointsReducer, DataPointsState } from './data-points-reducer'

// TODO: Test 'rowEnabledToggled'

describe('data points reducer', () => {
  const initialState: DataPointsState = {
    changed: false,
    meta: [],
    rows: [],
  }

  describe('dataPointsReducer - setInitialState', () => {
    it('should set initial state', async () => {
      const expected: DataPointsState = {
        changed: false,
        meta: [],
        rows: [
          {
            isNew: true,
            dataPoints: [],
          },
        ],
      }
      expect(
        dataPointsReducer(
          { ...initialState },
          {
            type: 'setInitialState',
            payload: {
              valueVariables: [],
              categoricalVariables: [],
              scoreNames: [],
              data: [],
            },
          }
        )
      ).toEqual(expected)
    })
  })
  describe('dataPointsReducer - rowAdded', () => {
    it('should add a row and set changed to true', async () => {
      const payload = {
        row: {
          isNew: false,
          dataPoints: [
            {
              name: 'test',
              value: '100',
            },
          ],
          metaId: 1,
        },
        categoricalVariables: [],
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
        meta: [{ enabled: true, id: 1 }],
        rows: [...initialState.rows, payload.row],
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
        editRow: {
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
        },
        categoricalVariables: [],
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
                name: payload.editRow.row.dataPoints[0]?.name,
                value: payload.editRow.row.dataPoints[0]?.value,
              },
            ],
          },
        ],
        changed: true,
      })
    })
  })
  it('should change "," to "." for non-categorical values', async () => {
    const payload = {
      editRow: {
        row: {
          isNew: false,
          dataPoints: [
            {
              name: 'testNew',
              value: '9,99',
            },
            {
              name: 'cat',
              value: 'A,1',
            },
          ],
        },
        rowIndex: 0,
      },
      categoricalVariables: [
        {
          name: 'cat',
          description: '',
          options: ['A,1', 'B'],
        },
      ],
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
              name: payload.editRow.row.dataPoints[0]?.name,
              value: '9.99',
            },
            {
              ...payload.editRow.row.dataPoints[1],
            },
          ],
        },
      ],
      changed: true,
    })
  })
})
