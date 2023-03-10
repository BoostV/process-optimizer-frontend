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
  // TODO: Simplify
  let notInCat = false
  let notInVal = false
  if (type === 'value') {
    notInCat = !categoricalVariables.map(c => c.name).includes(newName.trim())
    notInVal = !valueVariables
      .filter((_, i) => i !== index)
      .map(v => v.name)
      .includes(newName.trim())
  }
  if (type === 'categorical') {
    notInCat = !categoricalVariables
      .filter((_, i) => i !== index)
      .map(c => c.name)
      .includes(newName.trim())
    notInVal = !valueVariables.map(v => v.name).includes(newName.trim())
  }
  return (notInCat && notInVal) || 'Duplicate names not allowed'
}
