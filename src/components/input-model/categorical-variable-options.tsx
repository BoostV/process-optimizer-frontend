import { Grid, IconButton, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { ChangeEvent, useState } from 'react'

type CategoricalVariableOptionProps = {
  onOptionAdded: (data: string) => void
  error: string
}

export default function CategoricalVariableOptions({
  onOptionAdded,
  error,
}: CategoricalVariableOptionProps) {
  const [option, setOption] = useState('')

  function updateOption(option: string) {
    setOption(option)
  }

  function optionAdded() {
    onOptionAdded(option)
    setOption('')
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <TextField
          fullWidth
          name="option"
          label=""
          value={option}
          onChange={(e: ChangeEvent) =>
            updateOption((e.target as HTMLInputElement).value)
          }
          error={!!error}
          helperText={error}
        />
      </Grid>
      <Grid item xs={4} display="flex" alignItems="center">
        <IconButton size="small" onClick={() => optionAdded()}>
          <AddIcon color="primary" />
        </IconButton>
      </Grid>
    </Grid>
  )
}
