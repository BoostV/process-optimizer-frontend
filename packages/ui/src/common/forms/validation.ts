import { CategoricalVariableType } from '@ui/../../core/dist'
import { ValueVariableType } from '@ui/../../core/dist'

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

  let notInCategorical = !categoricalVariables
    .filter(categoricalFilter)
    .map(c => c.name)
    .includes(newName.trim())

  let notInValue = !valueVariables
    .filter(valueFilter)
    .map(c => c.name)
    .includes(newName.trim())

  return (notInCategorical && notInValue) || 'Duplicate names not allowed'
}
