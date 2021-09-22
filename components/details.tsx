import { TextField } from '@material-ui/core'
import { Info } from '../types/common'
import { TitleCard } from './title-card/title-card'

type DetailsProps = {
  info: Info
  updateName: (name: string) => void
  updateDescription: (description: string) => void
}

export default function Details(props: DetailsProps) {
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
          onChange={e => props.updateName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="dense"
          name="info.description"
          label="Description"
          value={info.description}
          onChange={e => props.updateDescription(e.target.value)}
        />
      </form>
    </TitleCard>
  )
}
