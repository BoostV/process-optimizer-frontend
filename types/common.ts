export type ExperimentType = {
  id: string,
  info: Info;
  categoricalVariables: CategoricalVariableType[];
  valueVariables: ValueVariableType[];
}

type Info = {
  name: string;
  description: string;
}

export type ValueVariableType = {
  name: string;
  description: string;
  minVal: string;
  maxVal: string;
  order: string;
}

export type CategoricalVariableType = {
  name: string;
  description: string;
  options: Option[];
  order: string;
}

type Option = {
  value: string;
}