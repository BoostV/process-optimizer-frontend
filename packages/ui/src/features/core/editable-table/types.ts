import { CombinedVariableInputType } from '@boostv/process-optimizer-frontend-core'

export type TableDataPointType = `${
  | CombinedVariableInputType
  | 'string'
  | 'rating'}`

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
