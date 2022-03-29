export const validation = {
  required: { required: 'Required' },
  mustBeNumber: {
    pattern: {
      value: /^-?[0-9][0-9.]*$/,
      message: 'Must be number',
    },
  },
}
