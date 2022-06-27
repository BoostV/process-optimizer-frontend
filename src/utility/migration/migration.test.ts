import { migrate, MIGRATIONS } from './migration'
import version5 from './data-formats/5.json'
import version4 from './data-formats/4.json'
import version3 from './data-formats/3.json'
import version2 from './data-formats/2.json'
import version1 from './data-formats/1.json'
import { emptyExperiment } from '../../store'
import { ExperimentType } from '../../types/common'
import fs from 'fs'

const loadLatestJson = () => {
  const fileVersions: number[] = fs
    .readdirSync('src/utility/migration/data-formats')
    .map(f => parseInt(f.replace(/[^0-9]/, '')))
  const latestVersion = Math.max(...fileVersions)
  return JSON.parse(
    fs.readFileSync(
      `src/utility/migration/data-formats/${latestVersion}.json`,
      {
        encoding: 'utf8',
        flag: 'r',
      }
    )
  )
}

describe('migration', () => {
  describe('migrate', () => {
    it('should not migrate if version is newer or equal to latest data format json', async () => {
      const latestJson = await loadLatestJson()
      const jsonNoMigration = {
        ...latestJson,
        info: { ...latestJson.info, dataFormatVersion: '10000' },
      }
      expect(migrate(jsonNoMigration)).toEqual(jsonNoMigration)
      expect(migrate({ ...latestJson })).toEqual({ ...latestJson })
    })

    it('should migrate to 3 from 1 (before versioning and no discrete/continuous)', () => {
      expect(migrate(version1, '3')).toEqual({
        ...version3,
        info: {
          ...version3.info,
          dataFormatVersion: version3.info.dataFormatVersion,
        },
        valueVariables: version3.valueVariables.map(v => {
          return {
            ...v,
            type: 'continuous',
          }
        }),
      })
    })

    it('should migrate to 3 from 2 (before versioning and with discrete as boolean instead of string)', () => {
      expect(migrate(version2, '3')).toEqual(version3)
    })

    it('should migrate to 4 from 3 (expectedMinimum added to result)', () => {
      expect(migrate(version3, '4')).toEqual(version4)
    })

    it(`should migrate to newest version (${
      MIGRATIONS.slice(-1)[0]?.version
    })`, async () => {
      const expected = loadLatestJson() as ExperimentType
      const actual = migrate({ ...version2 })
      expect(actual).toEqual(expected)
    })
  })

  describe('experiment properties', () => {
    //TODO: More/better tests
    it('newest data format json should match default empty experiment', () => {
      expect(Object.keys(emptyExperiment).length).toBe(
        Object.keys(version5).length
      )
      Object.keys(emptyExperiment).forEach(p =>
        expect(version5).toHaveProperty(p)
      )
    })
  })
})
