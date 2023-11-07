import { Button } from '@mui/material'
import { FC } from 'react'

type Props = {
  isInitialInteraction: boolean
  onClick: () => void
}

export const CopySuggested: FC<Props> = ({
  isInitialInteraction,
  onClick,
}: Props) => {
  return (
    <Button size="small" variant="outlined" onClick={onClick}>
      {isInitialInteraction
        ? 'Start experimenting'
        : 'Transfer all to data points'}
    </Button>
  )
}
