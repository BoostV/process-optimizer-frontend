import fs from 'fs'
import { currentVersion, experimentSchema } from '@core/common/types'
import z from 'zod'

const loadNamedJson = (version: number) => {
  return JSON.parse(
    fs.readFileSync(`src/common/util/migration/data-formats/${version}.json`, {
      encoding: 'utf8',
      flag: 'r',
    })
  )
}

export const storeLatestSchema = () => {
  const jsonSchema = z.toJSONSchema(experimentSchema)
  //  zodToJsonSchema(
  //   experimentSchema,
  //   `experiment-v${currentVersion}`
  // )
  fs.writeFileSync(
    `src/common/util/migration/schemas/${currentVersion}.json`,
    JSON.stringify(jsonSchema, undefined, 2)
  )
}

export const loadTestData = () => {
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
  const fileVersions: number[] = fs
    .readdirSync('./src/common/util/migration/data-formats')
    .map(f => parseInt(f.replace(/[^0-9]/, '')))
  const latestVersion = Math.max(...fileVersions)
  const loadLatestJson = () => loadNamedJson(latestVersion)
  return { schemas, fileVersions, loadLatestJson, loadNamedJson, latestVersion }
}
