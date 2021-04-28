import { Card, CardContent, TextField } from '@material-ui/core'
import { ChangeEvent } from 'react';
import { Info } from '../types/common';

type ModelEditorProps = {
  info: Info
  updateName: (name: string) => void
  updateDescription: (description: string) => void
}

export default function ModelEditor(props: ModelEditorProps) {
  const { info } = props

  return (
    <Card>
      <CardContent>
        <form>
          <TextField 
            fullWidth
            name="name" 
            label="Name" 
            value={info.name}
            required
            onChange={(e: ChangeEvent) => props.updateName((e.target as HTMLInputElement).value)}
          />
          <TextField
            fullWidth
            name="info.description"
            label="Description"
            value={info.description}
            required
            onChange={(e: ChangeEvent) => props.updateDescription((e.target as HTMLInputElement).value)}
          />
        </form>
      </CardContent>
    </Card>
  )
}
