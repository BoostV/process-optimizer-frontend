export type TableDataPointType = 'numeric' | 'options' | 'string' | 'rating'

export type TableDataPoint = {
  name: string
  label?: string
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
  note?: string
  scoreFunctions?: {
    scoreName: string
    label: string
    hasFunction: boolean
    useFunction: boolean
    responseVars: { symbol: string; name: string }[]
    values: Record<string, string>
  }[]
}
