import { Box } from '@mui/material'
import { InfoBox } from '@ui/features/core'

export function Playground() {
  return (
    <>
      <Box>Playground</Box>
      <InfoBox
        text="Test your quality function here."
        type="info"
        margin="8px 0 8px 0"
      />
    </>
  )
}
