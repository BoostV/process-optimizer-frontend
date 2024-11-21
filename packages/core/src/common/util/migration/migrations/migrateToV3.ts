/* eslint-disable @typescript-eslint/no-explicit-any */
export const migrateToV3 = (json: any): any => {
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
