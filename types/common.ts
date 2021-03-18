export type ExperimentType = {
  id: string | undefined,
  info: Info;
  categoricalVariables: CategoricalVariable[];
  valueVariables: ValueVariable[];
}

export type Info = {
  name: string;
  description: string;
}

export type CategoricalVariable = {
  name: string;
  description: string;
  minVal: string;
  maxVal: string;
  order: string;
}

export type ValueVariable = {
  name: string;
  description: string;
  options: Option[];
  order: string;
}

type Option = {
  value: string;
}