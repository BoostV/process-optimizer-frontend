/* eslint-disable @typescript-eslint/no-explicit-any */
export const migrateToV5 = (json: any): any => {
  return {
    ...json,
    scoreVariables: [
      {
        name: 'score',
        description: 'score',
        enabled: true,
      },
    ],
    dataPoints: json.dataPoints.map((dps: any) =>
      dps.map((dp: any) =>
        dp.name === 'score' && Array.isArray(dp.value)
          ? { ...dp, value: dp.value[0] ?? 0 }
          : dp
      )
    ),
  }
}
