import compareVersions from "compare-versions"
import { ExperimentType } from "../types/common"
import { migrate } from "./migration"

describe("migration", () => {

  const currentJson: ExperimentType = {
    id: "1234",
    info: {
      swVersion: "v1.2.0-16",
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
    it("should not migrate when not needed", () => {
      const jsonNoMigration = {...currentJson, info: { ...currentJson.info, swVersion: "10000.0.0" }}
      expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
      const jsonNoMigration2 = {...currentJson, info: { ...currentJson.info, swVersion: currentJson.info.swVersion + "-random" }}
      expect(migrate(jsonNoMigration2)).toEqual(jsonNoMigration2)
      expect(migrate({...currentJson})).toEqual({...currentJson})
    })

    it("should migrate to v1.2.0-16 - from before setting a version", () => {
      const oldJson = {
        ...currentJson,
        info: {
          name: currentJson.info.name,
          description: currentJson.info.description,
        },
        valueVariables: [
          {
            name: "name1",
            description: "desc1",
            minVal: "10.0",
            maxVal: "100",
          },
          {
            name: "name2",
            description: "desc2",
            minVal: "10.2",
            maxVal: "100.3",
          }
        ],
      }
      expect(migrate(oldJson)).toEqual({
        ...currentJson,
        valueVariables: currentJson.valueVariables.map(v => {
          return {
            ...v,
            type: 'continuous'
          }
        })
      })
    })

    it("should migrate to v1.2.0-16 - from before setting value boolean discrete", () => {
      const oldJson = {
        ...currentJson,
        info: {
          ...currentJson.info,
          swVersion: "v1.0.0"
        },
        valueVariables: [
          {
            name: "name1",
            description: "desc1",
            minVal: "10.0",
            maxVal: "100",
          },
          {
            name: "name2",
            description: "desc2",
            minVal: "10.2",
            maxVal: "100.3",
          }
        ],
      }
      expect(migrate(oldJson)).toEqual({
        ...currentJson,
        valueVariables: currentJson.valueVariables.map(v => {
          return {
            ...v,
            type: 'continuous'
          }
        })
      })
    })

    it("should migrate to v1.2.0-16 - from before setting value type discrete", () => {
      const oldJson = {
        ...currentJson,
        info: {
          ...currentJson.info,
          swVersion: "v1.1.5"
        },
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
      }
      expect(migrate(oldJson)).toEqual(currentJson)
      expect(migrate({...oldJson, info: { ...oldJson.info, swVersion: "v1.1.10" }})).toEqual(currentJson)
    })
  })
})