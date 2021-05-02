import { dataPointsReducer, DataPointsState, DataPointsTableAction } from "./data-points-reducer"
import { TableDataRow } from "../types/common"

describe("data points reducer", () => {
  
  describe("DataPointsTableEditToggledAction", () => {
    it("should toggle edit mode and save previous row", async () => {
      const payload = 0

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDIT_TOGGLED',
        payload
      }

      const initPrevRows: TableDataRow[] = [
        {
          dataPoints: [
            {
              name: "Milk",
              value: "100"
            },
            {
              name: "score",
              value: [1]
            }
          ],
          isEditMode: false,
          isNew: false,
        }
      ]

      const initRows: TableDataRow[] = [
        {
          dataPoints: [
            {
              name: "Milk",
              value: "200"
            },
            {
              name: "score",
              value: [1]
            }
          ],
          isEditMode: false,
          isNew: false,
        }
      ]

      const initState: DataPointsState = {
        prevRows: initPrevRows,
        rows: initRows
      }

      expect(dataPointsReducer(initState, action)).toEqual(
        {
          prevRows: initRows,
          rows:[
            {
              ...initRows[0],
              isEditMode: true,
              isNew: false,
            }
          ]}
        )
    })
  })

  describe("DataPointsTableEditCancelledAction", () => {
    it("should toggle edit mode and set row to prevRow", async () => {
      const payload = 0

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDIT_CANCELLED',
        payload
      }

      const initState: DataPointsState = {
        prevRows: [
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              }
            ],
            isEditMode: false,
            isNew: false,
          }
        ],
        rows: [
          {
            dataPoints: [
              {
                name: "Water",
                value: "200"
              }
            ],
            isEditMode: true,
            isNew: false,
          }
        ]
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        prevRows: initState.prevRows,
        rows: initState.prevRows
      })
    })

    it("should set row to prevRow but not toggle edit mode for new row", async () => {
      const payload = 0

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDIT_CANCELLED',
        payload
      }

      const initState: DataPointsState = {
        prevRows: [
          {
            dataPoints: [
              {
                name: "Water",
                value: ""
              }
            ],
            isEditMode: true,
            isNew: true,
          }
        ],
        rows: [
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              }
            ],
            isEditMode: true,
            isNew: true,
          }
        ]
      }
      expect(dataPointsReducer(initState, action)).toEqual({
        prevRows: initState.prevRows,
        rows: initState.prevRows
      })
    })

  })

  describe("DataPointsTableEditedAction", () => {
    it("should edit table cell - non-array value", async () => {
      const payload = {
        value: "300",
        rowIndex: 0,
        itemIndex: 1,
        useArrayForValue: "score"
      }

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDITED',
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows:[
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              },
              {
                name: "Milk",
                value: "200"
              },
              {
                name: "score",
                value: [0.5]
              }
            ],
            isEditMode: true,
            isNew: false,
          }
        ]
      }

      expect(dataPointsReducer(initState, action)).toEqual({
            ...initState,
            rows: [{
                ...initState.rows[0],
                dataPoints: [
                  {...initState.rows[0].dataPoints[0]},
                  {...initState.rows[0].dataPoints[1],
                    value: payload.value
                  },
                  {...initState.rows[0].dataPoints[2]}
                ]}
            ]})
    })

    it("should edit table cell - array value", async () => {
      const payload = {
        value: "0.2",
        rowIndex: 0,
        itemIndex: 1,
        useArrayForValue: "score"
      }

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_EDITED',
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows:[
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              },
              {
                name: "score",
                value: [0.1]
              }
            ],
            isEditMode: true,
            isNew: false,
          }
        ]
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        ...initState,
        rows: [{
            ...initState.rows[0],
            dataPoints: [
              {...initState.rows[0].dataPoints[0]},
              {...initState.rows[0].dataPoints[1],
                value: [payload.value]
              }
            ]}
        ]}
      )
    })
  })

  describe("DataPointsTableUpdatedAction", () => {
    it("should update table", async () => {
      const payload = [
        {
          dataPoints: [
            {
              name: "Milk",
              value: "200"
            },
            {
              name: "score",
              value: [0.3]
            }
          ],
          isEditMode: false,
          isNew: false,
        }
      ]

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_UPDATED',
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows:[
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              },
              {
                name: "score",
                value: [0.1]
              }
            ],
            isEditMode: false,
            isNew: false,
          }
        ]}

      expect(dataPointsReducer(initState, action)).toEqual({
          prevRows: [],
          rows: payload
        }
      )
    })
  })

  describe("DataPointsTableDeletedAction", () => {
    it("should delete row", async () => {
      const payload = 1

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_ROW_DELETED',
        payload
      }

      const initRows: TableDataRow[] = [
        {
          dataPoints: [
            {
              name: "Water",
              value: "100"
            },
            {
              name: "score",
              value: [0.1]
            }
          ],
          isEditMode: false,
          isNew: false,
        },
        {
          dataPoints: [
            {
              name: "Water",
              value: "200"
            },
            {
              name: "score",
              value: [0.2]
            }
          ],
          isEditMode: false,
          isNew: false,
        }
      ]

      const initState: DataPointsState = {
        prevRows: initRows,
        rows: initRows
      }

      expect(dataPointsReducer(initState, action)).toEqual({
          prevRows: initState.prevRows.slice(0, 1),
          rows: initState.rows.slice(0, 1)
        }
      )
      
    })
  })

  describe("DataPointsTableRowAddedAction", () => {
    it("should add row", async () => {
      const payload = {
        dataPoints: [
          {
            name: "Milk",
            value: ""
          },
          {
            name: "score",
            value: "0"
          }
        ],
        isEditMode: true,
        isNew: true,
      }

      const action: DataPointsTableAction = {
        type: 'DATA_POINTS_TABLE_ROW_ADDED',
        payload
      }

      const initRows: TableDataRow[] = [
        {
          dataPoints: [
            {
              name: "Milk",
              value: "100"
            },
            {
              name: "score",
              value: [0.1]
            }
          ],
          isEditMode: true,
          isNew: true,
        },
      ]

      const initState: DataPointsState = {
        prevRows: initRows,
        rows: initRows
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        prevRows: [
          {
            ...initState.rows[0],
            isEditMode: false,
            isNew: false 
          },
          payload
        ],
        rows: [
          {
            ...initState.rows[0],
            isEditMode: false,
            isNew: false 
          },
          payload
        ]
        }
      )
    })
  })
})