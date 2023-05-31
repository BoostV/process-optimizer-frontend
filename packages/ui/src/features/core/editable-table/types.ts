export type TableDataPointType = 'numeric' | 'options' | 'string' | 'rating'

export type TableDataPoint = {
  name: string
  value?: string
  tooltip?: string
  options?: string[] | undefined
  type: TableDataPointType
}

export type TableDataRow = {
  dataPoints: TableDataPoint[]
  isNew: boolean
  enabled?: boolean
  valid?: boolean
  metaId?: number
}
