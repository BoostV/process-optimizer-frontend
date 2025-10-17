import { Box, Button } from '@mui/material'
import FormInputText from '@ui/common/forms/form-input'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import useStyles from '@ui/features/data-points/settings/function-variables.style'
import { FunctionVariablesTable } from '@ui/features/data-points/settings/function-variables-table'

type FunctionVariableProps = {
  variables: string[]
}

export function FunctionVariables(props: FunctionVariableProps) {
  const { classes } = useStyles()
  const { control, formState } = useFormContext()

  const { variables } = props
  console.log('variables', variables)

  const [isAddingNew, setAddingNew] = useState(false)

  // const { handleSubmit, control } = useForm<{ name: string }>({
  //   defaultValues: { name: '' },
  //   mode: 'onSubmit',
  //   reValidateMode: 'onSubmit',
  // })

  return (
    <Box>
      <Box>Function variables</Box>
      <Box className={classes.contentContainer}>
        <Box p={1}>
          <FunctionVariablesTable />
        </Box>
        <Box>
          {!isAddingNew && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setAddingNew(true)}
            >
              Add variable
            </Button>
          )}
          {isAddingNew && (
            <Box className={classes.newVariableContainer}>
              <FormInputText
                name="newVariableName"
                control={control}
                fullWidth
                margin="dense"
                label="Name"
              />
              <FormInputText
                name="newVariable"
                control={control}
                fullWidth
                margin="dense"
                label="Variable"
              />
              <Button
                size="small"
                variant="outlined"
                onClick={() => console.log('formState', formState)}
                type="button"
              >
                Add
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setAddingNew(false)}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
