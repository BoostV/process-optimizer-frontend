import { IconButton, Tooltip } from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'

interface DownloadCSVButtonProps {
  light?: boolean
  onClick: () => void
}

const DownloadCSVButton = ({ light, onClick }: DownloadCSVButtonProps) => {
  return (
    <Tooltip title="Download CSV">
      <IconButton size="small" onClick={onClick}>
        <GetAppIcon fontSize="small" style={{ color: light ? 'white' : '' }} />
      </IconButton>
    </Tooltip>
  )
}

export default DownloadCSVButton
