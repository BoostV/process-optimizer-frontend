import {
  ValueVariableType,
  CategoricalVariableType,
} from '@boostv/process-optimizer-frontend-core'

export const validation = {
  required: { required: 'Required' },
  mustBeNumber: {
    pattern: {
      value: /^-?[0-9][0-9.,]*$/,
      message: 'Must be number',
    },
  },
}

export const isValidVariableName = (
  valueVariables: ValueVariableType[],
  categoricalVariables: CategoricalVariableType[],
  newName: string,
  type: 'value' | 'categorical',
  index?: number
) => {
  const filterSelf = (
    _: ValueVariableType | CategoricalVariableType,
    i: number
  ) => i !== index
  const valueFilter = type === 'value' ? filterSelf : () => true
  const categoricalFilter = type === 'categorical' ? filterSelf : () => true

  const notInCategorical = !categoricalVariables
    .filter(categoricalFilter)
    .map(c => c.name)
    .includes(newName.trim())

  const notInValue = !valueVariables
    .filter(valueFilter)
    .map(c => c.name)
    .includes(newName.trim())

  return (notInCategorical && notInValue) || 'Duplicate names not allowed'
}
