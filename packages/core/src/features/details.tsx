import { currentVersion } from '@/common/types/common'
import { TextField } from '@mui/material'
import { TitleCard } from './core/title-card/title-card'

export type Info = {
  name: string
  description: string
  swVersion: string
  dataFormatVersion: typeof currentVersion
}

type DetailsProps = {
  info: Info
  updateName: (name: string) => void
  updateDescription: (description: string) => void
}

export default function Details(props: DetailsProps) {
  const { info, updateName, updateDescription } = props

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
