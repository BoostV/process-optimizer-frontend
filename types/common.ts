export type ExperimentType = {
  id: string
  info: Info
  extras: object
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  scoreVariables: ScoreVariableType[]
  optimizerConfig: OptimizerConfig
  results: ExperimentResultType
  dataPoints: DataPointType[][]
}

export type ExperimentResultType = {
  id: string
  plots: { id: string; plot: string }[]
  next: (number | string)[]
  pickled: string
  expectedMinimum: Array<Array<number>>
  extras: object
}

export type Info = {
  name: string
  description: string
  swVersion: string
  dataFormatVersion: string
}

export type CategoricalVariableType = {
  name: string
  description: string
  options: string[]
}
export type ValueVariableType = {
  type: 'discrete' | 'continuous'
  name: string
  description: string
  min: number
  max: number
}
export type ScoreVariableType = {
  name: string
  description: string
  enabled: boolean
}

type Override<T, K> = Omit<T, keyof K> & K

export type ValueVariableInputType = Override<
  ValueVariableType,
  {
    min: string
    max: string
  }
>

export type VariableType = CategoricalVariableType | ValueVariableType

export type OptimizerConfig = {
  baseEstimator: string
  acqFunc: string
  initialPoints: number
  kappa: number
  xi: number
}

export type DataPointType =
  | CategorialDataPointType
  | ValueDataPointType
  | ScoreDataPointType
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

export type SpaceType = {
  type: string
  name: string
  from?: number
  to?: number
  categories?: string[]
}[]

export type TableDataPoint = {
  name: string
  value: string
  options?: string[] | undefined
}

export type TableDataRow = {
  dataPoints: TableDataPoint[]
  isEditMode: boolean
  isNew: boolean
}

export type CombinedVariableType = {
  name: string
  description: string
  minVal?: number
  maxVal?: number
  options?: string[]
}
