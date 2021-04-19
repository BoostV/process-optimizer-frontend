export type ExperimentType = {
  id: string
  info: Info
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  optimizerConfig: OptimizerConfig
  results: ExperimentResultType
}

export type ExperimentResultType = {
  id: string
  rawResult: string
}

export type Info = {
  name: string
  description: string
}

export type ValueVariableType = {
  name: string
  description: string
  minVal: string
  maxVal: string
  order?: string
}

export type CategoricalVariableType = {
  name: string
  description: string
  options: string[]
  order?: string
}

export type OptimizerConfig = {
  baseEstimater: string
  acqFunc: string
  initialPoints: number
  kappa: number
  xi: number
}
