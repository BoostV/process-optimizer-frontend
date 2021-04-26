export type ExperimentType = {
  id: string
  info: Info
  categoricalVariables: VariableType[]
  valueVariables: VariableType[]
  optimizerConfig: OptimizerConfig
  results: ExperimentResultType
  dataPoints: DataPointType[][]
}

export type ExperimentResultType = {
  id: string
  plots: {id: string, plot: string}[]
  next: (number|string)[],
  pickled: string
}

export type Info = {
  name: string
  description: string
}

export type VariableType = {
  name: string
  description: string
  minVal?: number
  maxVal?: number
  options?: string[]
  order?: string
}

export type OptimizerConfig = {
  baseEstimator: string
  acqFunc: string
  initialPoints: number
  kappa: number
  xi: number
}

export type DataPointType = CategorialDataPointType | ValueDataPointType | ScoreDataPointType
export type DataPointTypeValue = string | number | number[]

export type CategorialDataPointType = {
  name: string
  value: DataPointTypeValue
}
export type ValueDataPointType = {
  name: string
  value: DataPointTypeValue
}
export type ScoreDataPointType = {
  name: string
  value: DataPointTypeValue
}

export type SpaceType = {type: string, name:string, from?: number, to?: number, categories?: string[]}[]

export type TableDataPointValue = string | number | number[]

export type TableDataPoint = {
  name: string
  value: TableDataPointValue
  options?: string[] | undefined
}

export type TableDataRow = {
  dataPoints: TableDataPoint[]
  isEditMode: boolean
  isNew: boolean
}