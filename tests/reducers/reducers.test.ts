import { CategoricalVariableAddedAction, CategoricalVariableDeletedAction, CATEGORICAL_VARIABLE_ADDED, CATEGORICAL_VARIABLE_DELETED, ConfigurationUpdatedAction, CONFIGURATION_UPDATED, ExperimentDescriptionUpdatedAction, ExperimentNameUpdatedAction, ExperimentUpdatedAction, EXPERIMENT_DESCRIPTION_UPDATED, EXPERIMENT_NAME_UPDATED, EXPERIMENT_UPDATED, rootReducer, ValueVariableAddedAction, ValueVariableDeletedAction, VALUE_VARIABLE_ADDED, VALUE_VARIABLE_DELETED } from "../../reducers/reducers";
import { State } from "../../store";
import { CategoricalVariableType, ExperimentType, OptimizerConfig, ValueVariableType } from "../../types/common";

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
        minVal: "100",
        maxVal: "200",
      }],
      optimizerConfig: {
        baseEstimater: "GP",
        acqFunc: "gp_hedge",
        initialPoints: 3,
        kappa: 1.96,
        xi: 0.01,
      }
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
        minVal: "101",
        maxVal: "201",
      }],
      optimizerConfig: {
        baseEstimater: "GP",
        acqFunc: "gp_hedge",
        initialPoints: 4,
        kappa: 1.96,
        xi: 0.01,
      }
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
      experiment:{
        id: "1234",
        info: {
          name: "Muffins",
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
          minVal: "100",
          maxVal: "200",
        }],
        optimizerConfig: {
          baseEstimater: "GP",
          acqFunc: "gp_hedge",
          initialPoints: 3,
          kappa: 1.96,
          xi: 0.01,
        },
      },
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
        categoricalVariables: [{
          name: "Icing",
          description: "Sugary",
          options: [],
        }],
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: "100",
          maxVal: "200",
        }],
        optimizerConfig: {
          baseEstimater: "GP",
          acqFunc: "gp_hedge",
          initialPoints: 3,
          kappa: 1.96,
          xi: 0.01,
        },
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
        categoricalVariables: [{
          name: "Icing",
          description: "Sugary",
          options: [],
        }],
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: "100",
          maxVal: "200",
        },
        payload],
        optimizerConfig: {
          baseEstimater: "GP",
          acqFunc: "gp_hedge",
          initialPoints: 3,
          kappa: 1.96,
          xi: 0.01,
        },
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
        categoricalVariables: [{
          name: "Icing",
          description: "Sugary",
          options: [],
        }],
        valueVariables: [],
        optimizerConfig: {
          baseEstimater: "GP",
          acqFunc: "gp_hedge",
          initialPoints: 3,
          kappa: 1.96,
          xi: 0.01,
        },
      }
    })
  })

  it("should add categorial variable", async () => {
    const payload: CategoricalVariableType = {
      name: "Fat",
      description: "Fatty",
      options: [],
    }

    const action: CategoricalVariableAddedAction = {
      type: CATEGORICAL_VARIABLE_ADDED,
      payload
    }

    expect(rootReducer(initState, action)).toEqual({
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
        },
        payload],
        valueVariables: [{
          name: "Water",
          description: "Wet",
          minVal: "100",
          maxVal: "200",
        }],
        optimizerConfig: {
          baseEstimater: "GP",
          acqFunc: "gp_hedge",
          initialPoints: 3,
          kappa: 1.96,
          xi: 0.01,
        },
      }
    })
  })

  it("should delete categorical variable", async () => {
    const payload: CategoricalVariableType = {
      name: "Icing",
      description: "Sugary",
      options: [],
    }

    const action: CategoricalVariableDeletedAction = {
      type: CATEGORICAL_VARIABLE_DELETED,
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
        }],
        optimizerConfig: {
          baseEstimater: "GP",
          acqFunc: "gp_hedge",
          initialPoints: 3,
          kappa: 1.96,
          xi: 0.01,
        },
      }
    })
  })

  it("should update configuration", async () => {
    const payload: OptimizerConfig = {
      baseEstimater: "GP",
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
          minVal: "100",
          maxVal: "200",
        }],
        optimizerConfig: payload,
      }
    })
  })

})