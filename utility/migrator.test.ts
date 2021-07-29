import { ExperimentType } from "../types/common"
import { migrate } from "./migrator"

describe("migrator", () => {

  const currentJson: ExperimentType = {
    id: "1234",
    info: {
      swVersion: "1.2.8",
      name: "Cake",
      description: "Yummy",
    },
    categoricalVariables: [{
      name: "Icing",
      description: "Sugary",
      options: [],
    }],
    valueVariables: [
      {
        name: "name1",
        description: "desc1",
        min: 10,
        max: 100,
        type: 'discrete',
      },
      {
        name: "name2",
        description: "desc2",
        min: 10.2,
        max: 100.3,
        type: 'continuous',
      }
    ],
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

  describe("migrate", () => {
    it("should migrate from 1.x.x", () => {
      const oldJson = {
        id: "1234",
        info: {
          swVersion: "1.1.5",
          name: "Cake",
          description: "Yummy",
        },
        categoricalVariables: [{
          name: "Icing",
          description: "Sugary",
          options: [],
        }],
        valueVariables: [
          {
            name: "name1",
            description: "desc1",
            minVal: "10.0",
            maxVal: "100",
            discrete: true,
          },
          {
            name: "name2",
            description: "desc2",
            minVal: "10.2",
            maxVal: "100.3",
            discrete: false,
          }
        ],
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
      expect(migrate(oldJson)).toEqual(currentJson)
      expect(migrate({...oldJson, info: { ...oldJson.info, swVersion: "1.1.9" }})).toEqual(currentJson)
      expect(migrate({...oldJson, info: { ...oldJson.info, swVersion: "1.1.10" }})).toEqual(currentJson)
    })

    it("should not migrate if version needs no migrations", () => {
      const semverSplits = currentJson.info.swVersion.split(".")
      const newerThanCurrent = [parseInt(semverSplits[0]) + 1, semverSplits[1], semverSplits[2]].join(".")
      const jsonNoMigration = {...currentJson, info: { ...currentJson.info, swVersion: newerThanCurrent }}
      expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
    })
  })
})