import { CategoricalVariableAddedAction, CategoricalVariableDeletedAction, CATEGORICAL_VARIABLE_ADDED, CATEGORICAL_VARIABLE_DELETED, ConfigurationUpdatedAction, CONFIGURATION_UPDATED, DataPointsAddedAction, DataPointsUpdatedAction, DATA_POINTS_ADDED, DATA_POINTS_UPDATED, ExperimentDescriptionUpdatedAction, ExperimentNameUpdatedAction, ExperimentUpdatedAction, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, ResultRegisteredAction, RESULT_REGISTERED, rootReducer, ValueVariableAddedAction, ValueVariableDeletedAction, VALUE_VARIABLE_ADDED, VALUE_VARIABLE_DELETED } from "../../reducers/reducers";
import { State } from "../../store";
import { DataPointType, ExperimentResultType, ExperimentType, OptimizerConfig, VariableType } from "../../types/common";

describe("experiment reducer", () => {
  const initState: State = {
    experiment:{
      id: "1234",
      info: {
        name: "Cake",
        description: "Yummy",
      },
      categoricalVariables: [{
        name: "Icing",
        description: "Sugary",
        options: [],
      }],
      valueVariables: [{
        name: "Water",
        description: "Wet",
        minVal: 100,
        maxVal: 200,
      }],
      optimizerConfig: {
        baseEstimator: "GP",
        acqFunc: "gp_hedge",
        initialPoints: 3,
        kappa: 1.96,
        xi: 0.01,
      },
      results: {
        id: "",
        next: [],
        plots: [],
        pickled: ""
      },
      dataPoints: []
    }
  }

  it("should update whole experiment", async () => {
    const payload: ExperimentType = {
      id: "5678",
      info: {
        name: "Not cake",
        description: "Not yummy",
      },
      categoricalVariables: [{
        name: "Not icing",
        description: "Not sugary",
        options: [],
      }],
      valueVariables: [{
        name: "Not water",
        description: "Not wet",
        minVal: 101,
        maxVal: 201,
      }],
      optimizerConfig: {
        baseEstimator: "GP",
        acqFunc: "gp_hedge",
        initialPoints: 4,
        kappa: 1.96,
        xi: 0.01,
      },
      results: {
        id: "123",
        next: [],
        plots: [],
        pickled: "123"
      },
      dataPoints: []
    }

    const action: ExperimentUpdatedAction = {
      type: EXPERIMENT_UPDATED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment: payload
    })
  })

  it("should update name", async () => {
    const action: ExperimentNameUpdatedAction = {
      type: EXPERIMENT_NAME_UPDATED,
      payload: "Muffins"
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        id: "1234",
        info: {
          name: "Muffins",
          description: "Yummy",
        }
      }
    })
  })

  it("should update description", async () => {
    const action: ExperimentDescriptionUpdatedAction = {
      type: EXPERIMENT_DESCRIPTION_UPDATED,
      payload: "Tasty"
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        info: {
          name: "Cake",
          description: "Tasty",
        }
      }
    })
  })

  it("should add value variable", async () => {
    const payload: VariableType = {
      name: "Flour",
      description: "Wet",
      minVal: 300,
      maxVal: 400,
    }

    const action: ValueVariableAddedAction = {
      type: VALUE_VARIABLE_ADDED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: 100,
          maxVal: 200,
        },
        payload]
      } 
    })
  })

  it("should delete value variable", async () => {
    const payload: VariableType = {
      name: "Water",
      description: "Wet",
      minVal: 100,
      maxVal: 200,
    }

    const action: ValueVariableDeletedAction = {
      type: VALUE_VARIABLE_DELETED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        valueVariables: []
      }
    })
  })

  it("should add categorial variable", async () => {
    const payload: VariableType = {
      name: "Fat",
      description: "Fatty",
      options: [],
    }

    const action: CategoricalVariableAddedAction = {
      type: CATEGORICAL_VARIABLE_ADDED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        categoricalVariables: [{
          name: "Icing",
          description: "Sugary",
          options: [],
        },
        payload]
      }
    })
  })

  it("should delete categorical variable", async () => {
    const payload: VariableType = {
      name: "Icing",
      description: "Sugary",
      options: [],
    }

    const action: CategoricalVariableDeletedAction = {
      type: CATEGORICAL_VARIABLE_DELETED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        categoricalVariables: []
      }
    })
  })

  it("should update configuration", async () => {
    const payload: OptimizerConfig = {
      baseEstimator: "GP",
      acqFunc: "gp_hedge",
      initialPoints: 4,
      kappa: 1.97,
      xi: 0.02,
    }

    const action: ConfigurationUpdatedAction = {
      type: CONFIGURATION_UPDATED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        optimizerConfig: payload
      }
    })
  })

  describe("ResultRegisteredAction", () => {

    it("should update result", async () => {
      const payload: ExperimentResultType = {
        id: "myExperiment",
        next: [1,2,3,"Red"],
        pickled: "pickled",
        plots: [{id: "sample", plot: "base64encodedData"}]
      }
  
      const action: ResultRegisteredAction = {
        type: RESULT_REGISTERED,
        payload: payload
      }
  
      expect(rootReducer(initState, action)).toEqual({
        experiment:{...initState.experiment,
          results: payload
        }
      })
    })
  })

  describe("DataPointsUpdatedAction", () => {

    it("should update data points", async () => {
      const payload: DataPointType[][] = [
        [
          {
            name: "New point 1",
            value: 1
          },
          {
            name: "score",
            value: [2]
          }
        ]
      ]
  
      const action: DataPointsUpdatedAction = {
        type: DATA_POINTS_UPDATED,
        payload: payload
      }
  
      expect(rootReducer(initState, action)).toEqual({
        experiment:{...initState.experiment,
          dataPoints: payload
        }
      })
    })
  })
})
