import { Button, TextField } from '@material-ui/core';
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
    <>
      <TextField
        name="option"
        label=""
        value={option}
        onChange={(e: ChangeEvent) => updateOption((e.target as HTMLInputElement).value)}
      />
      <br />
      <Button variant="outlined" onClick={() => {onOptionAdded()}} size="small">Add option</Button>
      <br />
    </>
  )
}



