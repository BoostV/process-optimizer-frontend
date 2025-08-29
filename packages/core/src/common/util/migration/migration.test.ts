import { describe, expect, it } from 'vitest'
import { JSONSchemaFaker } from 'json-schema-faker'
import { migrate, _migrate, MIGRATIONS } from './migration'
import version18 from './data-formats/18.json'
import version17 from './data-formats/17.json'
import version16 from './data-formats/16.json'
import version3 from './data-formats/3.json'
import version2 from './data-formats/2.json'
import version1 from './data-formats/1.json'
import catapult from '@core/sample-data/catapult.json'
import badCatapult from '@core/sample-data/bad-catapult.json'
import badCookie from '@core/sample-data/bad-cookie.json'
import brokenV9Experiment from '@core/sample-data/version-9-with-strings-in-optimizer-config.json'
import large from '@core/sample-data/large.json'
import { emptyExperiment } from '@core/context/experiment'
import { formatNext } from './migrations/migrateToV9'
import {
  ExperimentType,
  ScoreVariableType,
  experimentSchema,
  scoreName,
} from '@core/common/types'
import { storeLatestSchema, loadTestData } from './test-utils'
import { migrateToV17, migrateToV18 } from './migrations'

describe('Migration of data format', () => {
  storeLatestSchema()

  const latestVersion =
    experimentSchema.shape.info.shape.dataFormatVersion.value

  const latestVersionNumber = Number(latestVersion)

  const { schemas, loadLatestJson, loadNamedJson } = loadTestData()

  describe.each(Array(100).fill(null))('Automatic schema testing run', () => {
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

  describe('migrate', () => {
    it('should fail if not migrating to newest version', async () => {
      const latestJson = await loadLatestJson()
      expect(() => migrate(latestJson)).not.toThrowError()
    })

    it('should migrate catapult to newest version', async () => {
      const actual = migrate({ ...catapult })
      expect(actual.info.dataFormatVersion).toEqual(latestVersion)
    })

    it('should migrate bad catapult to newest version', async () => {
      const actual = migrate({ ...badCatapult })
      expect(actual.info.dataFormatVersion).toEqual(latestVersion)
    })

    it('should migrate bad cookie to newest version', async () => {
      const actual = migrate({ ...badCookie })
      expect(actual.info.dataFormatVersion).toEqual(latestVersion)
    })

    it('should migrate large experiment to newest version', async () => {
      const actual = migrate({ ...large })
      expect(actual.info.dataFormatVersion).toEqual(latestVersion)
    })

    it('should migrate broken version 9 to newest version', () => {
      const actual = migrate({ ...brokenV9Experiment })
      expect(actual.info.dataFormatVersion).toEqual(latestVersion)
    })
  })

  describe('_migrate', () => {
    it.each([
      latestVersionNumber,
      latestVersionNumber + 1,
      latestVersionNumber + 42,
    ])(
      'should not migrate if version is newer or equal to latest data format json (version=%i)',
      async version => {
        const latestJson = await loadLatestJson()
        const jsonNoMigration = {
          ...latestJson,
          info: {
            ...latestJson.info,
            dataFormatVersion: String(version),
          },
        }
        expect(_migrate(jsonNoMigration)).toEqual(jsonNoMigration)
        expect(_migrate({ ...latestJson })).toEqual({ ...latestJson })
      }
    )

    it(`should migrate from 2 through ${latestVersion}`, () => {
      for (let index = 2; index < latestVersionNumber; index++) {
        const prev = index
        const current = index + 1
        expect(_migrate(loadNamedJson(prev), `${current}`)).toMatchObject(
          loadNamedJson(current)
        )
      }
    })

    // Special case
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

  describe('migrateToV17', () => {
    const scoreVarsMultiObjective = [
      {
        name: 'score',
        description: 'score',
        enabled: true,
      },
      {
        name: 'score2',
        description: 'score',
        enabled: true,
      },
    ] satisfies ScoreVariableType[]

    const scoreVarsMultiObjectiveDisabled = [
      {
        name: 'score',
        description: 'score',
        enabled: true,
      },
      {
        name: 'score2',
        description: 'score',
        enabled: true,
      },
    ] satisfies ScoreVariableType[]

    it.each([
      ['multiobjective, all enabled', scoreVarsMultiObjective],
      ['multiobjective, one disabled', scoreVarsMultiObjectiveDisabled],
    ])('scoreVariables should be renamed, %s', (_, scoreVariables) => {
      const experiment16 = {
        ...version16,
        scoreVariables,
      } as unknown as ExperimentType
      expect(migrateToV17(experiment16).scoreVariables).toEqual([
        {
          name: scoreName,
          description: scoreName,
          enabled: scoreVariables[0]?.enabled,
        },
        {
          name: scoreName + ' 2',
          description: scoreName,
          enabled: scoreVariables[1]?.enabled,
        },
      ])
    })

    const dataPointsSingle = [...version16.dataPoints]
    const dataPointsMulti = [...version16.dataPoints].map(dp => ({
      ...dp,
      data: [...dp.data].concat([
        {
          type: 'score',
          name: 'score2',
          value: 2,
        },
      ]),
    }))

    it.each([
      ['one score exists', dataPointsSingle, false],
      ['two scores exist', dataPointsMulti, true],
    ])(
      'data points should be renamed, %s',
      (_, dataPoints, isMultiObjective) => {
        const experiment16 = {
          ...version16,
          dataPoints,
        } as unknown as ExperimentType
        const actual = [
          {
            meta: {
              enabled: true,
              valid: true,
              id: 1,
            },
            data: [
              {
                type: 'categorical',
                name: 'Icing',
                value: 'Brown',
              },
              {
                type: 'numeric',
                name: 'name1',
                value: 10,
              },
              {
                type: 'numeric',
                name: 'name2',
                value: 10.2,
              },
              {
                type: 'score',
                name: scoreName,
                value: 0.5,
              },
            ].concat(
              isMultiObjective
                ? [
                    {
                      type: 'score',
                      name: scoreName + ' 2',
                      value: 2,
                    },
                  ]
                : []
            ),
          },
        ]
        expect(migrateToV17(experiment16).dataPoints).toEqual(actual)
      }
    )
  })

  describe('migrateToV18', () => {
    it('should set maxEnabledVariablesBeforeSuggestionLimitation to 10', () => {
      expect(version17.info.dataFormatVersion).toBe('17')
      const migrated = migrateToV18(version17)
      expect(migrated.info.dataFormatVersion).toBe('18')
      expect(
        migrated.optimizerConfig.maxEnabledVariablesBeforeSuggestionLimitation
      ).toBe(10)
    })
  })

  describe('experiment properties', () => {
    //TODO: More/better tests - maybe this can be made obsolete by schema testing
    it('newest data format json should match default empty experiment', () => {
      expect(Object.keys(emptyExperiment).length).toBe(
        Object.keys(version18).length
      )
      Object.keys(emptyExperiment).forEach(p =>
        expect(version18).toHaveProperty(p)
      )
    })
  })
})
