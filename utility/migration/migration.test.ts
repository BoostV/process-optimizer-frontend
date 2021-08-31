import { migrate } from "./migration"
import version3 from './data-formats/3.json'
import version2 from './data-formats/2.json'
import version1 from './data-formats/1.json'

describe("migration", () => {

  describe("migrate", () => {
    it("should not migrate if version is newer or equal to latest migration", () => {
      const jsonNoMigration = {...version3, info: { ...version3.info, dataFormatVersion: "10000.0.0" }}
      expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
      expect(migrate({...version3})).toEqual({...version3})
    })

    it("should migrate to 3 - from before versioning and no discrete/continuous (v1)", () => {
      expect(migrate(version1)).toEqual({
        ...version3,
        info: {
          ...version3.info,
          dataFormatVersion: version3.info.dataFormatVersion
        },
        valueVariables: version3.valueVariables.map(v => {
          return {
            ...v,
            type: 'continuous'
          }
        })
      })
    })

    it("should migrate to 3 - from before versioning and with discrete as boolean instead of string (v2)", () => {
      expect(migrate(version2)).toEqual(version3)
    })
  })
})