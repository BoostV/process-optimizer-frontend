import { initialState } from "../store"
import { ExperimentType } from "../types/common"
import { calculateSpace, calculateData } from "./converters"

describe("converters", () => {
    const sampleExperiment: ExperimentType = {...initialState.experiment,
        id: "123",
        info: {...initialState.experiment.info,
            name: "Cookies",
            description: "Bager haremus' peberkager"
        },
        categoricalVariables: [
            {name: "Kunde",description:"",options:["Mus","Ræv"]}
        ],
        valueVariables: [
            {type: "discrete", name: "Sukker", description: "", min: 0, max: 1000},
            {type: "discrete", name: "Peber", description: "", min: 0, max: 1000},
            {type: "continuous", name: "Hvedemel", description: "", min: 0.0, max: 1000.8}
        ],
        optimizerConfig: {
            baseEstimator: "GP",
            acqFunc:"gp_hedge",
            initialPoints: 2,
            kappa: 1.96,
            xi: 0.012
        },
        dataPoints: [
            [{name: "Sukker", value: 23}, {name: "Peber", value: 982}, {name: "Hvedemel", value: 632}, {name: "Kunde", value: "Mus"}, {name: "score", value: [0.1]}],
            [{name: "Sukker", value: 15}, {name: "Peber", value: 123}, {name: "Hvedemel", value: 324}, {name: "Kunde", value: "Ræv"}, {name: "score", value: [0.2]}]
          ]
    }

    describe("calculateSpace", () => {
        it("should convert space to proper output format", () => {
            const space = calculateSpace(sampleExperiment)
            expect(space).toContainEqual({type: "discrete", from: 0, name: "Sukker", to: 1000})
            expect(space).toContainEqual({type: "continuous", from: 0, name: "Hvedemel", to: 1000.8})
        })
    })

    describe("calculateData", () => {
        it("should format data in proper output format", () => {
            const expectedData = [
                {xi: [23,982,632,"Mus"], yi: 0.1},
                {xi: [15,123,324,"Ræv"], yi: 0.2}
              ]
            const actualData = calculateData(sampleExperiment.categoricalVariables, sampleExperiment.valueVariables, sampleExperiment.dataPoints)
            expect(actualData).toEqual(expectedData)
        })
    })
})