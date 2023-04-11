import { migrate, _migrate, MIGRATIONS } from './migration'
import version10 from './data-formats/10.json'
import version9 from './data-formats/9.json'
import version8 from './data-formats/8.json'
import version7 from './data-formats/7.json'
import version6 from './data-formats/6.json'
import version5 from './data-formats/5.json'
import version4 from './data-formats/4.json'
import version3 from './data-formats/3.json'
import version2 from './data-formats/2.json'
import version1 from './data-formats/1.json'
import catapult from '@core/sample-data/catapult.json'
import badCatapult from '@core/sample-data/bad-catapult.json'
import large from '@core/sample-data/large.json'
import fs from 'fs'
import { emptyExperiment } from '@core/context/experiment'
import { formatNext } from './migrations/migrateToV9'

const loadLatestJson = () => {
  const fileVersions: number[] = fs
    .readdirSync('./src/common/util/migration/data-formats')
    .map(f => parseInt(f.replace(/[^0-9]/, '')))
  const latestVersion = Math.max(...fileVersions)
  return JSON.parse(
    fs.readFileSync(
      `src/common/util/migration/data-formats/${latestVersion}.json`,
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

    it('should migrate to 5 from 4', () => {
      expect(_migrate(version4, '5')).toEqual(version5)
    })

    it('should migrate to 6 from 5 (changedSinceEvaluation added to root)', () => {
      expect(_migrate(version5, '6')).toEqual(version6)
    })

    it('should migrate to 7 from 6', () => {
      expect(_migrate(version6, '7')).toEqual(version7)
    })

    it('should migrate to 8 from 7', () => {
      expect(_migrate(version7, '8')).toEqual(version8)
    })

    it('should migrate to 9 from 8', () => {
      expect(_migrate(version8, '9')).toEqual(version9)
    })

    it('should migrate to 10 from 9 (introduce zod)', () => {
      expect(_migrate(version9, '10')).toEqual(version10)
    })

    it(`should migrate to newest version (${
      MIGRATIONS.slice(-1)[0]?.version
    })`, async () => {
      const expected = loadLatestJson()
      const actual = _migrate({ ...version2 })
      expect(actual).toEqual(expected)
    })

    it('should migrate catapult to newest version', async () => {
      const actual = migrate({ ...catapult })
      expect(actual.info.dataFormatVersion).toEqual(
        MIGRATIONS.slice(-1)[0]?.version
      )
    })

    it('should migrate bad catapult to newest version', async () => {
      const actual = migrate({ ...badCatapult })
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

  describe('migrateToV9 formatNext', () => {
    it('should return nested array - input is not nested', () => {
      expect(formatNext([1, 2, 3])).toEqual([[1, 2, 3]])
    })
    it('should return nested array - input is nested', () => {
      expect(formatNext([[1, 2, 3]])).toEqual([[1, 2, 3]])
    })
    it('should return empty nested array - input is empty array', () => {
      expect(formatNext([])).toEqual([[]])
      expect(formatNext([[]])).toEqual([[]])
    })
  })

  describe('experiment properties', () => {
    //TODO: More/better tests
    it('newest data format json should match default empty experiment', () => {
      expect(Object.keys(emptyExperiment).length).toBe(
        Object.keys(version10).length
      )
      Object.keys(emptyExperiment).forEach(p =>
        expect(version10).toHaveProperty(p)
      )
    })
  })
})
