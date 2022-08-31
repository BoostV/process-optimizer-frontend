export type TableDataPoint = {
  name: string
  value: string
  tooltip?: string
  options?: string[] | undefined
}

export type TableDataRow = {
  dataPoints: TableDataPoint[]
  isNew: boolean
}
