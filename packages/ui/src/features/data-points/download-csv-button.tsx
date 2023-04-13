import { IconButton, Tooltip } from '@mui/material'
import { GetApp } from '@mui/icons-material'

interface DownloadCSVButtonProps {
  light?: boolean
  onClick: () => void
}

const DownloadCSVButton = ({ light, onClick }: DownloadCSVButtonProps) => {
  return (
    <Tooltip title="Download CSV">
      <IconButton size="small" onClick={onClick}>
        <GetApp fontSize="small" style={{ color: light ? 'white' : '' }} />
      </IconButton>
    </Tooltip>
  )
}

export default DownloadCSVButton
