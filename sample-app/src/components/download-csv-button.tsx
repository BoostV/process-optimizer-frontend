import { IconButton, Tooltip } from '@mui/material'
import {
  selectDataPoints,
  useExperiment,
  useSelector,
} from '@/context/experiment'
import { dataPointsToCSV } from '@/utility/converters'
import { saveCSVToLocalFile } from '@process-optimizer-frontend/core/src/common/util/save-to-local-file'
import GetAppIcon from '@mui/icons-material/GetApp'

interface DownloadCSVButtonProps {
  light?: boolean
}

const DownloadCSVButton = ({ light }: DownloadCSVButtonProps) => {
  const {
    state: {
      experiment: { id },
    },
  } = useExperiment()
  const dataPoints = useSelector(selectDataPoints)
  return (
    <Tooltip title="Download CSV">
      <IconButton
        size="small"
        onClick={() =>
          saveCSVToLocalFile(dataPointsToCSV(dataPoints), id + '.csv')
        }
      >
        <GetAppIcon fontSize="small" style={{ color: light ? 'white' : '' }} />
      </IconButton>
    </Tooltip>
  )
}

export default DownloadCSVButton
