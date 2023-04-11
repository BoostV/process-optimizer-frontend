import { ExperimentType, isExperiment } from '@core/common/types'

import compareVersions from 'compare-versions'
import {
  migrateToV3,
  migrateToV4,
  migrateToV6,
  migrateToV7,
  migrateToV5,
  migrateToV8,
  migrateToV9,
  migrateToV10,
} from './migrations'

export const migrate = (json: any): ExperimentType => {
  const migrated = _migrate(
    json,
    MIGRATIONS[MIGRATIONS.length - 1]?.version ?? '0'
  )
  if (isExperiment(migrated)) {
    return migrated
  }
  throw new Error('Error migrating json to experiment')
}

//TODO: Compare json to current ExperimentType and set missing fields to default values?
export const _migrate = (
  json: any,
  stopAtVersion = MIGRATIONS[MIGRATIONS.length - 1]?.version ?? '0'
): unknown => {
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
): ExperimentType | unknown => {
  console.log('Migrating', json.info.dataFormatVersion)
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
  { version: '3', converter: migrateToV3 },
  { version: '4', converter: migrateToV4 },
  { version: '5', converter: migrateToV5 },
  { version: '6', converter: migrateToV6 },
  { version: '7', converter: migrateToV7 },
  { version: '8', converter: migrateToV8 },
  { version: '9', converter: migrateToV9 },
  { version: '10', converter: migrateToV10 },
]
