import { migrate } from "./migration"
import version1_0_0 from './data-formats/1.0.0.json'
import jsonBeforeVersion from './data-formats/-1.json'
import jsonBeforeVersionOlder from './data-formats/-2.json'

describe("migration", () => {

  describe("migrate", () => {
    it("should not migrate if version is newer or equal to latest migration", () => {
      const jsonNoMigration = {...version1_0_0, info: { ...version1_0_0.info, dataFormatVersion: "10000.0.0" }}
      expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
      expect(migrate({...version1_0_0})).toEqual({...version1_0_0})
    })

    it("should migrate to 1.0.0 - from before setting a version and before setting discrete as boolean", () => {
      expect(migrate(jsonBeforeVersion)).toEqual({
        ...version1_0_0,
        info: {
          ...version1_0_0.info,
          dataFormatVersion: version1_0_0.info.dataFormatVersion
        },
        valueVariables: version1_0_0.valueVariables.map(v => {
          return {
            ...v,
            type: 'continuous'
          }
        })
      })
    })

    it("should migrate to 1.0.0 - from before setting a version and before setting discrete as string", () => {
      expect(migrate(jsonBeforeVersionOlder)).toEqual(version1_0_0)
    })
  })
})