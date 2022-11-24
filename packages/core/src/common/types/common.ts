// IMPORTANT!
// Change the current version when doing structural
// changes to any types belonging to ExperimentType
export const currentVersion = '8'

export type Info = {
  name: string
  description: string
  swVersion: string
  dataFormatVersion: typeof currentVersion
}
