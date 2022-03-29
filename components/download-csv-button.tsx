import { IconButton, Tooltip } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context'
import { dataPointsToCSV } from '../utility/converters'
import { saveCSVToLocalFile } from '../utility/save-to-local-file'
import GetAppIcon from '@material-ui/icons/GetApp'

interface DownloadCSVButtonProps {
  light?: boolean
}

const DownloadCSVButton = ({ light }: DownloadCSVButtonProps) => {
  const {
    state: {
      experiment: { id, dataPoints },
    },
  } = useExperiment()
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
