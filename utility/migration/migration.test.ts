import { ExperimentType } from "../../types/common"
import { migrate } from "./migration"
import currentJson from './data-formats/1.0.0.json'
import jsonBeforeVersion from './data-formats/-1.json'
import jsonBeforeVersionOlder from './data-formats/-2.json'

describe("migration", () => {

  describe("migrate", () => {
    it("should not migrate if version is newer or equal to latest migration", () => {
      const jsonNoMigration = {...currentJson, info: { ...currentJson.info, dataFormatVersion: "10000.0.0" }}
      expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
      expect(migrate({...currentJson})).toEqual({...currentJson})
    })

    it("should migrate to 1.0.0 - from before setting a version and before setting discrete as boolean", () => {
      expect(migrate(jsonBeforeVersion)).toEqual({
        ...currentJson,
        info: {
          ...currentJson.info,
          dataFormatVersion: currentJson.info.dataFormatVersion
        },
        valueVariables: currentJson.valueVariables.map(v => {
          return {
            ...v,
            type: 'continuous'
          }
        })
      })
    })

    it("should migrate to 1.0.0 - from before setting a version and before setting discrete as string", () => {
      expect(migrate(jsonBeforeVersionOlder)).toEqual(currentJson)
    })
  })
})