import compareVersions from 'compare-versions'
import { ExperimentType } from '../../types/common'

//TODO: Compare json to current ExperimentType and set missing fields to default values?
export const migrate = (json: any): ExperimentType => {
  const version = json.info.dataFormatVersion !== undefined ? json.info.dataFormatVersion : "0"
  const firstMigration = MIGRATIONS.find(m => compareVersions(version, m.version) === -1)
  return firstMigration === undefined ? json : doMigrations(firstMigration, json)
}

const doMigrations = (migration: Migration, json: any): any => {
  json = migration.converter(json)
  const migrationIndex = MIGRATIONS.findIndex(m => m === migration)
  const isLastMigration = migrationIndex === MIGRATIONS.length - 1
  if (isLastMigration) {
    return bumpVersion(json, migration.version)
  } else {
    return doMigrations(MIGRATIONS[migrationIndex + 1], json)
  }
}

const bumpVersion = (json: any, version: string): any => {
  return { ...json, info: {...json.info, dataFormatVersion: version } }
}

const convertTo3 = (json: any): any => {
  return {
    ...json,
    valueVariables: json.valueVariables.map(v => {
      return {
        name: v.name,
        description: v.description,
        min: parseFloat(v.minVal),
        max: parseFloat(v.maxVal),
        type: v.discrete !== undefined ? (v.discrete ? 'discrete' : 'continuous') : 'continuous'
      }
    })
  }
}

interface Migration {
  version: string,
  converter: (json: any) => any,
}

//Versions that need migration
//To add new migration:
//* Add new json file to /data-formats
//* Add new migration and converter function below
//* Write unit test
export const MIGRATIONS: Migration[] = [
  { version: "3", converter: convertTo3 },
]