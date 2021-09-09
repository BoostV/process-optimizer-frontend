import { ExperimentAction } from "./experiment-reducers";
import { rootReducer } from "./reducers";
import { State } from "../store";
import { CategoricalVariableType, DataPointType, ExperimentResultType, ExperimentType, OptimizerConfig, ValueVariableType } from "../types/common";

describe("experiment reducer", () => {
  const initState: State = {
    experiment:{
      id: "1234",
      info: {
        swVersion: "",
        name: "Cake",
        description: "Yummy",
        dataFormatVersion: "1.0.0",
      },
      categoricalVariables: [{
        name: "Icing",
        description: "Sugary",
        options: [],
      }],
      valueVariables: [{
        type: "continuous",
        name: "Water",
        description: "Wet",
        min: 100,
        max: 200,
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
        pickled: "",
        extras: {}
      },
      dataPoints: [],
      extras: {
        experimentSuggestionCount: 1
      }
    }
  }

  it("should update whole experiment", async () => {
    const payload: ExperimentType = {
      id: "5678",
      info: {
        swVersion: "",
        name: "Not cake",
        description: "Not yummy",
        dataFormatVersion: "1.0.0",
      },
      categoricalVariables: [{
        name: "Not icing",
        description: "Not sugary",
        options: [],
      }],
      valueVariables: [{
        type: "continuous",
        name: "Not water",
        description: "Not wet",
        min: 101,
        max: 201,
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
        pickled: "123",
        extras: {}
      },
      dataPoints: [],
      extras: {
        experimentSuggestionCount: 1
      }
    }

    const action: ExperimentAction = {
      type: 'updateExperiment',
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment: payload
    })
  })

  it("should update name", async () => {
    const action: ExperimentAction = {
      type: 'updateExperimentName',
      payload: "Muffins"
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        id: "1234",
        info: {
          ...initState.experiment.info,
          name: "Muffins",
        }
      }
    })
  })

  it("should update description", async () => {
    const action: ExperimentAction = {
      type: 'updateExperimentDescription',
      payload: "Tasty"
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        info: {
          ...initState.experiment.info,
          description: "Tasty",
        }
      }
    })
  })

  it("should add value variable", async () => {
    const payload: ValueVariableType = {
      type: "continuous",
      name: "Flour",
      description: "Wet",
      min: 300,
      max: 400,
    }

    const action: ExperimentAction = {
      type: 'addValueVariable',
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        valueVariables: [{
          name: "Water",
          description: "Wet",
          type: "continuous",
          min: 100,
          max: 200,
        },
        payload]
      } 
    })
  })

  it("should delete value variable", async () => {
    const payload: ValueVariableType = {
      type: "continuous",
      name: "Water",
      description: "Wet",
      min: 100,
      max: 200,
    }

    const action: ExperimentAction = {
      type: 'deleteValueVariable',
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
      experiment:{...initState.experiment,
        valueVariables: []
      }
    })
  })

  it("should add categorial variable", async () => {
    const payload: CategoricalVariableType = {
      name: "Fat",
      description: "Fatty",
      options: [],
    }

    const action: ExperimentAction = {
      type: 'addCategorialVariable',
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
    const payload: CategoricalVariableType = {
      name: "Icing",
      description: "Sugary",
      options: [],
    }

    const action: ExperimentAction = {
      type: 'deleteCategorialVariable',
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

    const action: ExperimentAction = {
      type: 'updateConfiguration',
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
        extras: {},
        plots: [{id: "sample", plot: "base64encodedData"}]
      }
  
      const action: ExperimentAction = {
        type: 'registerResult',
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
            value: "1"
          },
          {
            name: "score",
            value: [2]
          }
        ]
      ]
  
      const action: ExperimentAction = {
        type: 'updateDataPoints',
        payload
      }
  
      expect(rootReducer(initState, action)).toEqual({
        experiment:{...initState.experiment,
          dataPoints: payload
        }
      })
    })
  })
})

