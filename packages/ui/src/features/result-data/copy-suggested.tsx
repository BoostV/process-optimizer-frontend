import { Button } from '@mui/material'
import { FC } from 'react'

type Props = {
  onClick: () => void
}

export const CopySuggested: FC<Props> = ({ onClick }: Props) => {
  return (
    <Button size="small" variant="outlined" onClick={onClick}>
      Transfer all to data points
    </Button>
  )
}
