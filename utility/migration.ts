import compareVersions from 'compare-versions'
import { ExperimentType } from '../types/common'

export const migrate = (json: any): ExperimentType => {
  const version = json.info.swVersion
  const needsNoMigration = compareVersions(version, MIGRATIONS[MIGRATIONS.length - 1].version) === 1
  if (needsNoMigration) {
    return json
  }
  const firstMigration = MIGRATIONS.find(m => compareVersions(version, m.version) === -1)
  return doMigrations(firstMigration, json)
}

const doMigrations = (migration: Migration, json: any): any => {
  json = migration.converter(json)
  const migrationIndex = MIGRATIONS.findIndex(m => m === migration)
  const isLastMigration = migrationIndex === MIGRATIONS.length - 1
  if (isLastMigration) {
    return { ...json, info: {...json.info, swVersion: migration.version } }
  } else {
    return doMigrations(MIGRATIONS[migrationIndex + 1], json)
  }
}

const convertTo_1_2_0 = (json: any): any => {
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
//* Add new migration below
//* Add new converter function above
//* Write unit test

//TODO: Change version?
export const MIGRATIONS: Migration[] = [
  { version: "1.2.0", converter: convertTo_1_2_0 },
]