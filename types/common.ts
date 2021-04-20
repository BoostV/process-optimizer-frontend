export type ExperimentType = {
  id: string
  info: Info
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  optimizerConfig: OptimizerConfig
  results: ExperimentResultType
  dataPoints: DataPointType[]
}

export type ExperimentResultType = {
  id: string
  rawResult: string
  plots: {id: string, plot: string}[]
  next: number[]
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

export type OptimizerConfig = {
  baseEstimator: string
  acqFunc: string
  initialPoints: number
  kappa: number
  xi: number
}

export type DataPointType = CategorialDataPointType | ValueDataPointType

export type CategorialDataPointType = {
  name: string
  value: string
}

export type ValueDataPointType = {
  name: string
  value: number
}

export type SpaceType = {name:string, from: number, to: number}[]