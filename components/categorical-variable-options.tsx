import { Button, Grid, IconButton, TextField } from '@material-ui/core';
import AddIcon from "@material-ui/icons/Add";
import { ChangeEvent, useState } from 'react';

type CategoricalVariableOptionProps = {
  onOptionAdded: (data: string) => void
}

export default function CategoricalVariableOptions(props: CategoricalVariableOptionProps) {
  const [option, setOption] = useState("")

  function updateOption(option: string) {
    setOption(option)
  }

  function onOptionAdded() {
    props.onOptionAdded(option)
    setOption("")
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <TextField
          fullWidth
          name="option"
          label=""
          value={option}
          onChange={(e: ChangeEvent) => updateOption((e.target as HTMLInputElement).value)}
        />
      </Grid>
      <Grid item xs={4}>
        <IconButton size="small" onClick={() => onOptionAdded()}>
          <AddIcon />
        </IconButton>
      </Grid>
    </Grid>
  )
}



