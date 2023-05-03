import { Info } from '@boostv/process-optimizer-frontend-core'
import { TextField } from '@mui/material'
import { TitleCard } from './title-card/title-card'

type DetailsProps = {
  id?: string
  info: Info
  updateName: (name: string) => void
  updateDescription: (description: string) => void
}

export function Details(props: DetailsProps) {
  const { id, info, updateName, updateDescription } = props

  return (
    <TitleCard id={id} title="Details">
      <form>
        <TextField
          fullWidth
          margin="dense"
          name="name"
          label="Name"
          value={info.name}
          required
          onChange={e => updateName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="dense"
          name="info.description"
          label="Description"
          value={info.description}
          onChange={e => updateDescription(e.target.value)}
        />
      </form>
    </TitleCard>
  )
}
