import { dataPointsReducer, DataPointsState, DataPointsTableEditCancelledAction, DataPointsTableEditedAction, DataPointsTableEditToggledAction, DataPointsTableRowAddedAction, DataPointsTableRowDeletedAction, DataPointsTableUpdatedAction, DATA_POINTS_TABLE_EDITED, DATA_POINTS_TABLE_EDIT_CANCELLED, DATA_POINTS_TABLE_EDIT_TOGGLED, DATA_POINTS_TABLE_ROW_ADDED, DATA_POINTS_TABLE_ROW_DELETED, DATA_POINTS_TABLE_UPDATED } from "../../reducers/data-points-reducer"
import { TableDataRow } from "../../types/common"

//TODO: Simplify by reusing state

describe("data points reducer", () => {
  describe("DataPointsTableEditToggledAction", () => {
    it("should toggle edit mode", async () => {
      const payload = 1

      const action: DataPointsTableEditToggledAction = {
        type: DATA_POINTS_TABLE_EDIT_TOGGLED,
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows: [
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          }
        ]
      }

      expect(dataPointsReducer(initState, action)).toEqual(
        {
          prevRows: [],
          rows:[
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
          {
            dataPoints: [],
            isEditMode: true,
            isNew: false,
          }
          ]}
        )
    })
  })

  describe("DataPointsTableEditCancelledAction", () => {
    /*it("should cancel edit", async () => {
      const payload = {
        prevRows: [
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
          {
            dataPoints: [
              {
                name: "Water",
                value: "50"
              }
            ],
            isEditMode: false,
            isNew: false,
          }
        ],
        rowIndex: 1  
      }

      const action: DataPointsTableEditCancelledAction = {
        type: DATA_POINTS_TABLE_EDIT_CANCELLED,
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows:
        [
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              }
            ],
            isEditMode: true,
            isNew: false,
          }
        ]
      }

      expect(dataPointsReducer(initState, action)).toEqual(payload.prevRows)
    })*/
  })

  describe("DataPointsTableEditedAction", () => {
    it("should edit table cell - non-array value", async () => {
      const payload = {
        value: "300",
        rowIndex: 1,
        itemIndex: 1,
        useArrayForValue: "score"
      }

      const action: DataPointsTableEditedAction = {
        type: DATA_POINTS_TABLE_EDITED,
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows:[
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
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

      expect(dataPointsReducer(initState, action)).toEqual(
        {
          prevRows: [],
          rows:[
            {
              dataPoints: [],
              isEditMode: false,
              isNew: false,
            },
            {
              dataPoints: [
                {
                  name: "Water",
                  value: "100"
                },
                {
                  name: "Milk",
                  value: "300"
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
        })
    })

    it("should edit table cell - array value", async () => {
      const payload = {
        value: "0.2",
        rowIndex: 1,
        itemIndex: 1,
        useArrayForValue: "score"
      }

      const action: DataPointsTableEditedAction = {
        type: DATA_POINTS_TABLE_EDITED,
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows:[
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
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
        prevRows: [],
        rows:[
          {
            dataPoints: [],
            isEditMode: false,
            isNew: false,
          },
          {
            dataPoints: [
              {
                name: "Water",
                value: "100"
              },
              {
                name: "score",
                value: ["0.2"]
              }
            ],
            isEditMode: true,
            isNew: false,
          }
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

      const action: DataPointsTableUpdatedAction = {
        type: DATA_POINTS_TABLE_UPDATED,
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

      const action: DataPointsTableRowDeletedAction = {
        type: DATA_POINTS_TABLE_ROW_DELETED,
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
      }

      expect(dataPointsReducer(initState, action)).toEqual({
          prevRows: [],
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

      const action: DataPointsTableRowAddedAction = {
        type: DATA_POINTS_TABLE_ROW_ADDED,
        payload
      }

      const initState: DataPointsState = {
        prevRows: [],
        rows: [
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
      }

      expect(dataPointsReducer(initState, action)).toEqual({
        prevRows: [],
        rows:
          [
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