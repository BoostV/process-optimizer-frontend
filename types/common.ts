export type ExperimentType = {
  id: string
  info: Info
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
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

export type ValueVariableType = {
  name: string
  description: string
  minVal: number
  maxVal: number
  order?: number
}

export type CategoricalVariableType = {
  name: string
  description: string
  options: string[]
  order?: string
}

export type VariableType = ValueVariableType | CategoricalVariableType

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