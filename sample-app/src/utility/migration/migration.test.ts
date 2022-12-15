import { migrate, _migrate, MIGRATIONS } from './migration'
import version6 from './data-formats/6.json' assert { type: 'json' }
import version5 from './data-formats/5.json' assert { type: 'json' }
import version4 from './data-formats/4.json' assert { type: 'json' }
import version3 from './data-formats/3.json' assert { type: 'json' }
import version2 from './data-formats/2.json' assert { type: 'json' }
import version1 from './data-formats/1.json' assert { type: 'json' }
import catapult from '../../../sample-data/catapult.json' assert { type: 'json' }
import large from '../../../sample-data/large.json' assert { type: 'json' }
import fs from 'fs'
import { ExperimentType } from '@process-optimizer-frontend/core'
import { emptyExperiment } from '@process-optimizer-frontend/core'

const loadLatestJson = () => {
  const fileVersions: number[] = fs
    .readdirSync('./src/utility/migration/data-formats')
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
    it('should fail if not migrating to newest version', async () => {
      const latestJson = await loadLatestJson()
      expect(() => migrate(latestJson)).not.toThrowError()
    })
  })

  describe('_migrate', () => {
    it('should not migrate if version is newer or equal to latest data format json', async () => {
      const latestJson = await loadLatestJson()
      const jsonNoMigration = {
        ...latestJson,
        info: { ...latestJson.info, dataFormatVersion: '10000' },
      }
      expect(_migrate(jsonNoMigration)).toEqual(jsonNoMigration)
      expect(_migrate({ ...latestJson })).toEqual({ ...latestJson })
    })

    it('should migrate to 3 from 1 (before versioning and no discrete/continuous)', () => {
      expect(_migrate(version1, '3')).toEqual({
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
      expect(_migrate(version2, '3')).toEqual(version3)
    })

    it('should migrate to 4 from 3 (expectedMinimum added to result)', () => {
      expect(_migrate(version3, '4')).toEqual(version4)
    })

    it('should migrate to 6 from 4 (changedSinceEvaluation added to root)', () => {
      expect(_migrate(version5, '6')).toEqual(version6)
    })

    it(`should migrate to newest version (${
      MIGRATIONS.slice(-1)[0]?.version
    })`, async () => {
      const expected = loadLatestJson() as ExperimentType
      const actual = _migrate({ ...version2 })
      expect(actual).toEqual(expected)
    })

    it('should migrate catapult to newest version', async () => {
      const actual = migrate({ ...catapult })
      expect(actual.info.dataFormatVersion).toEqual(
        MIGRATIONS.slice(-1)[0]?.version
      )
    })

    it('should migrate large experiment to newest version', async () => {
      const actual = migrate({ ...large })
      expect(actual.info.dataFormatVersion).toEqual(
        MIGRATIONS.slice(-1)[0]?.version
      )
    })
  })

  describe('experiment properties', () => {
    //TODO: More/better tests
    it('newest data format json should match default empty experiment', () => {
      expect(Object.keys(emptyExperiment).length).toBe(
        Object.keys(version6).length
      )
      Object.keys(emptyExperiment).forEach(p =>
        expect(version6).toHaveProperty(p)
      )
    })
  })
})
