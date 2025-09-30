import { Box, Button } from '@mui/material'
import FormInputText from '@ui/common/forms/form-input'
import { useState } from 'react'
import { useFormContext } from 'react-hook-form'

type FunctionVariableProps = {
  variables: string[]
}

export function FunctionVariables(props: FunctionVariableProps) {
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
      <Button
        size="small"
        variant="outlined"
        onClick={() => setAddingNew(true)}
      >
        Add variable
      </Button>
      {isAddingNew && (
        <Box>
          <FormInputText
            name="newVariable"
            control={control}
            fullWidth
            margin="dense"
            label="Name"
          />
          <Button
            size="small"
            variant="outlined"
            onClick={() => console.log('formState', formState)}
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
  )
}
