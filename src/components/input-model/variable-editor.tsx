import { Box, Button } from '@mui/material'
import useStyles from './variable-editor.style'
import { CategoricalVariableType, ValueVariableType } from '@/types/common'
import { useForm } from 'react-hook-form'
import { FormInputText } from '@/utility/forms'
import { FormRadioGroup } from '@/utility/forms/form-radio-group'
import { validation } from '@/utility/forms/validation'

type VariableEditorProps = {
  isAddVariableDisabled: boolean
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function VariableEditor(props: VariableEditorProps) {
  const { isAddVariableDisabled } = props

  const classes = useStyles()

  // add useForm controller
  const { handleSubmit, control } = useForm({})

  const onSubmit = (data: any) => {
    console.log(data)
  }

  return (
    <>
      <Box ml={2} mr={2}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormInputText
            name="name"
            control={control}
            fullWidth
            margin="dense"
            label="Name"
            rules={validation.required}
          />
          <FormInputText
            name="description"
            control={control}
            fullWidth
            margin="dense"
            label="Description"
          />
          <Box mb={0} className={classes.narrowInputContainer}>
            <Box className={classes.narrowInput} pr={1}>
              <FormInputText
                name="min"
                control={control}
                fullWidth
                margin="dense"
                label="Min"
                rules={{ ...validation.required, ...validation.mustBeNumber }}
              />
            </Box>
            <Box className={classes.narrowInput}>
              <FormInputText
                name="max"
                control={control}
                fullWidth
                margin="dense"
                label="Max"
                rules={{ ...validation.required, ...validation.mustBeNumber }}
              />
            </Box>
          </Box>
          <Box mt={1} mb={1}>
            <FormRadioGroup
              name="type"
              control={control}
              values={['continuous', 'discrete']}
              labels={['Continuous', 'Discrete']}
              tooltips={[
                'Values include non-integers',
                'Values are only integers',
              ]}
              ariaLabel={'value-type'}
            />
          </Box>
          <Button
            size="small"
            disabled={isAddVariableDisabled}
            variant="outlined"
            type="submit"
          >
            Add variable
          </Button>
        </form>
      </Box>
    </>
  )
}
