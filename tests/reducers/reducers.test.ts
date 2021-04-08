import { ExperimentDescriptionUpdatedAction, ExperimentNameUpdatedAction, ExperimentUpdatedAction, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, rootReducer, ValueVariableAddedAction, ValueVariableDeletedAction, VALUE_VARIABLE_ADDED, VALUE_VARIABLE_DELETED } from "../../reducers/reducers";
import { State } from "../../store";
import { ExperimentType, ValueVariableType } from "../../types/common";

describe("experiment reducer", () => {
  const initState: State = {
    experiment:{
      id: "1234",
      info: {
        name: "Cake",
        description: "Yummy",
      },
      categoricalVariables: [],
      valueVariables: [{
        name: "Water",
        description: "Wet",
        minVal: "100",
        maxVal: "200",
      }],
    }
  }

  it("should update name", async () => {
    const action: ExperimentNameUpdatedAction = {
      type: EXPERIMENT_NAME_UPDATED,
      payload: "Muffins"
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{
        id: "1234",
        info: {
          name: "Muffins",
          description: "Yummy",
        },
        categoricalVariables: [],
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: "100",
          maxVal: "200",
        }],
      }
    })
  })

  it("should update description", async () => {
    const action: ExperimentDescriptionUpdatedAction = {
      type: EXPERIMENT_DESCRIPTION_UPDATED,
      payload: "Tasty"
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{
        id: "1234",
        info: {
          name: "Cake",
          description: "Tasty",
        },
        categoricalVariables: [],
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: "100",
          maxVal: "200",
        }],
      }
    })
  })

  it("should add value variable", async () => {
    const payload: ValueVariableType = {
      name: "Flour",
      description: "Wet",
      minVal: "300",
      maxVal: "400",
    }

    const action: ValueVariableAddedAction = {
      type: VALUE_VARIABLE_ADDED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{
        id: "1234",
        info: {
          name: "Cake",
          description: "Yummy",
        },
        categoricalVariables: [],
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: "100",
          maxVal: "200",
        },
        payload],
      }
    })
  })

  it("should delete value variable", async () => {
    const payload: ValueVariableType = {
      name: "Water",
      description: "Wet",
      minVal: "100",
      maxVal: "200",
    }

    const action: ValueVariableDeletedAction = {
      type: VALUE_VARIABLE_DELETED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{
        id: "1234",
        info: {
          name: "Cake",
          description: "Yummy",
        },
        categoricalVariables: [],
        valueVariables: [],
      }
    })
  })

  it("should update whole experiment", async () => {
    const payload: ExperimentType = {
      id: "5678",
      info: {
        name: "Not cake",
        description: "Not yummy",
      },
      categoricalVariables: [],
      valueVariables: [{
        name: "Not water",
        description: "Not wet",
        minVal: "101",
        maxVal: "201",
      }],
    }

    const action: ExperimentUpdatedAction = {
      type: EXPERIMENT_UPDATED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment: payload
    })
  })

})