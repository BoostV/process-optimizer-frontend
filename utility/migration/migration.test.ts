import { migrate } from "./migration"
import version3 from './data-formats/3.json'
import version2 from './data-formats/2.json'
import version1 from './data-formats/1.json'
import { emptyExperiment } from "../../store"
const fs = require('fs')

describe("migration", () => {
  describe("migrate", () => {
    it("should not migrate if version is newer or equal to latest data format json", () => {
      const fileVersions: number[] = fs.readdirSync('utility/migration/data-formats').map(f => parseInt(f.slice('.')[0]))
      const latestVersion = Math.max(...fileVersions)
      import(`./data-formats/${latestVersion}.json`).then(latestJson => {
        const jsonNoMigration = {...latestJson, info: { ...latestJson.info, dataFormatVersion: "10000" }}
        expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
        expect(migrate({...latestJson})).toEqual({...latestJson})
      })
    })

    it("should migrate to 3 from 1 (before versioning and no discrete/continuous)", () => {
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

    it("should migrate to 3 from 2 (before versioning and with discrete as boolean instead of string)", () => {
      expect(migrate(version2)).toEqual(version3)
    })
  })

  describe("experiment properties", () => {
    //TODO: More/better tests
    it("newest data format json should match default empty experiment", () => {
      expect(Object.keys(emptyExperiment).length).toBe(Object.keys(version3).length)
      Object.keys(emptyExperiment).forEach(p => 
        expect(version3).toHaveProperty(p)
      )
    })
  })
})