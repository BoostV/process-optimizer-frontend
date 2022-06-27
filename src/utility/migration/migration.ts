import compareVersions from 'compare-versions'
import { ExperimentType } from '../../types/common'

//TODO: Compare json to current ExperimentType and set missing fields to default values?
export const migrate = (
  json: any,
  stopAtVersion = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? '0'
): ExperimentType => {
  const version = json.info.dataFormatVersion ?? '0'
  const firstMigration = MIGRATIONS.find(
    m => compareVersions(version, m.version) === -1
  )
  return firstMigration === undefined ||
    compareVersions(firstMigration.version, stopAtVersion) > 0
    ? json
    : doMigrations(firstMigration, json, stopAtVersion)
}

const doMigrations = (
  migration: Migration,
  json: any,
  stopAtVersion: string
): void => {
  json = migration.converter(json)
  const migrationIndex = MIGRATIONS.findIndex(m => m === migration)
  const isLastMigration =
    migrationIndex === MIGRATIONS.length - 1 ||
    migration.version === stopAtVersion
  if (isLastMigration) {
    return bumpVersion(json, migration.version)
  } else {
    const nextMigration = MIGRATIONS[migrationIndex + 1]
    if (nextMigration) {
      return doMigrations(nextMigration, json, stopAtVersion)
    }
  }
}

const bumpVersion = (json: any, version: string): any => {
  return { ...json, info: { ...json.info, dataFormatVersion: version } }
}

const convertTo3 = (json: any): any => {
  return {
    ...json,
    valueVariables: json.valueVariables.map((v: any) => {
      return {
        name: v.name,
        description: v.description,
        min: parseFloat(v.minVal),
        max: parseFloat(v.maxVal),
        type:
          v.discrete !== undefined
            ? v.discrete
              ? 'discrete'
              : 'continuous'
            : 'continuous',
      }
    }),
  }
}

const convertTo4 = (json: any): any => {
  return {
    ...json,
    results: { ...json.results, expectedMinimum: [] },
  }
}

const convertTo5 = (json: ExperimentType): ExperimentType => {
  return {
    ...json,
    scoreVariables: [
      {
        name: 'score',
        description: 'score',
        enabled: true,
      },
    ],
    dataPoints: json.dataPoints.map(dps =>
      dps.map(dp =>
        dp.name === 'score' && Array.isArray(dp.value)
          ? { ...dp, value: dp.value[0] ?? 0 }
          : dp
      )
    ),
  }
}

interface Migration {
  version: string
  converter: (json: any) => any
}

//Versions that need migration
//To add new migration:
//* Add new json file to /data-formats
//* Add new migration and converter function below
//* Write unit test
export const MIGRATIONS: Migration[] = [
  { version: '3', converter: convertTo3 },
  { version: '4', converter: convertTo4 },
  { version: '5', converter: convertTo5 },
]
