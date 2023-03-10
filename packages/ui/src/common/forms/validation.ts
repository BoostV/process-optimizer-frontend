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
  newName: string
) =>
  (!categoricalVariables.map(c => c.name).includes(newName.trim()) &&
    !valueVariables.map(v => v.name).includes(newName.trim())) ||
  'Duplicate names not allowed'
