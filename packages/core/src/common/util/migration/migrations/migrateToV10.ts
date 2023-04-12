import { experimentSchema } from '../../../types/common'

export const migrateToV10 = (json: any) => {
  return experimentSchema.parse({
    ...json,
    info: { ...json.info, dataFormatVersion: '10' },
  })
}
