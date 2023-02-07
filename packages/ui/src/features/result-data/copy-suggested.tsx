import { Box, Button } from '@mui/material'
import { FC } from 'react'

type Props = {
  onClick: () => void
}

export const CopySuggested: FC<Props> = ({ onClick }: Props) => {
  return (
    <Box mb={2} mr={2} display="flex" justifyContent="right">
      <Button size="small" variant="outlined" onClick={onClick}>
        Copy all to data points
      </Button>
    </Box>
  )
}
