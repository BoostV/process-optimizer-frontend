import { TextField } from '@material-ui/core'
import { ChangeEvent } from 'react'
import { Info } from '../types/common'
import { TitleCard } from './title-card'

type ModelEditorProps = {
  info: Info
  updateName: (name: string) => void
  updateDescription: (description: string) => void
}

export default function ModelEditor(props: ModelEditorProps) {
  const { info } = props

  return (
    <TitleCard title="Details">
      <form>
        <TextField 
          fullWidth
          margin="dense"
          name="name" 
          label="Name" 
          value={info.name}
          required
          onChange={(e: ChangeEvent) => props.updateName((e.target as HTMLInputElement).value)}
        />
        <TextField
          fullWidth
          margin="dense"
          name="info.description"
          label="Description"
          value={info.description}
          onChange={(e: ChangeEvent) => props.updateDescription((e.target as HTMLInputElement).value)}
        />
      </form>
    </TitleCard>
  )
}
