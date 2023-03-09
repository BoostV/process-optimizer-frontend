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

export const isValidValueVariableName = (
  valueVariables: ValueVariableType[],
  newName: string
) =>
  !valueVariables.map(v => v.name).includes(newName.trim()) ||
  'Duplicate names not allowed'
