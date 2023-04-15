import zodToJsonSchema from 'zod-to-json-schema'
import { JSONSchemaFaker } from 'json-schema-faker'
import { migrate, _migrate, MIGRATIONS } from './migration'
import version11 from './data-formats/11.json'
import version3 from './data-formats/3.json'
import version2 from './data-formats/2.json'
import version1 from './data-formats/1.json'
import catapult from '@core/sample-data/catapult.json'
import badCatapult from '@core/sample-data/bad-catapult.json'
import badCookie from '@core/sample-data/bad-cookie.json'
import large from '@core/sample-data/large.json'
import fs from 'fs'
import { emptyExperiment } from '@core/context/experiment'
import { formatNext } from './migrations/migrateToV9'
import { currentVersion, experimentSchema } from '@core/common/types'

const fileVersions: number[] = fs
  .readdirSync('./src/common/util/migration/data-formats')
  .map(f => parseInt(f.replace(/[^0-9]/, '')))
const latestVersion = Math.max(...fileVersions)

const loadNamedJson = (version: number) => {
  return JSON.parse(
    fs.readFileSync(`src/common/util/migration/data-formats/${version}.json`, {
      encoding: 'utf8',
      flag: 'r',
    })
  )
}

const loadLatestJson = () => loadNamedJson(latestVersion)

const storeLatestSchema = () => {
  const jsonSchema = zodToJsonSchema(
    experimentSchema,
    `experiment-v${currentVersion}`
  )
  fs.writeFileSync(
    `src/common/util/migration/schemas/${currentVersion}.json`,
    JSON.stringify(jsonSchema, undefined, 2)
  )
}

storeLatestSchema()

const schemas = Object.fromEntries(
  fs
    .readdirSync('src/common/util/migration/schemas')
    .filter(f => f.endsWith('.json'))
    .map(
      f =>
        [
          f,
          fs.readFileSync(`src/common/util/migration/schemas/${f}`, {
            encoding: 'utf-8',
            flag: 'r',
          }),
        ] as const
    )
    .map(x => [parseInt(x[0].replace(/[^0-9]/, '')), JSON.parse(x[1])])
)

describe.each(Array(100).fill(null))('Automatic schema testing run %i', () => {
  it.each(Object.keys(schemas))(
    `should migrate %i to ${latestVersion} from faker data`,
    async idx => {
      // TODO investigate why JSONSchemaFaker generates datapoints[].meta = undefined. It treats the meta field as optional (schema 11)
      JSONSchemaFaker.option({ alwaysFakeOptionals: true })
      const sample = JSONSchemaFaker.generate(schemas[idx])
      const migrated = _migrate(sample)
      expect(experimentSchema.parse(migrated))
    }
  )
})

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

    it(`should migrate from 2 through ${latestVersion}`, () => {
      for (let index = 2; index < latestVersion; index++) {
        const prev = index
        const current = index + 1
        expect(_migrate(loadNamedJson(prev), `${current}`)).toEqual(
          loadNamedJson(current)
        )
      }
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

    it('should migrate bad cookie to newest version', async () => {
      const actual = migrate({ ...badCookie })
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
    //TODO: More/better tests - maybe this can be mabe obsolete by schema testing
    it('newest data format json should match default empty experiment', () => {
      expect(Object.keys(emptyExperiment).length).toBe(
        Object.keys(version11).length
      )
      Object.keys(emptyExperiment).forEach(p =>
        expect(version11).toHaveProperty(p)
      )
    })
  })
})
