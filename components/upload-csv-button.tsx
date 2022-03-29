import { IconButton, Input, Tooltip } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context'
import { DataPointType } from '../types/common'
import { csvToDataPoints } from '../utility/converters'
import PublishIcon from '@material-ui/icons/Publish'

const readFile = (file, dataHandler) => {
  var result = ''
  if (file) {
    const reader = new FileReader()
    reader.onload = e => dataHandler(e.target.result as string)
    reader.readAsText(file)
  }
  return result
}
interface UploadCSVButtonProps {
  light?: boolean
  onUpload: (dataPoints: DataPointType[][]) => void
}

const UploadCSVButton = ({ onUpload, light }: UploadCSVButtonProps) => {
  const {
    state: {
      experiment: { valueVariables, categoricalVariables, scoreVariables },
    },
  } = useExperiment()
  const handleFileUpload = e =>
    readFile(e.target.files[0], data =>
      onUpload(
        csvToDataPoints(
          data,
          valueVariables,
          categoricalVariables,
          scoreVariables
        )
      )
    )

  return (
    <Tooltip title="Upload CSV">
      <IconButton component="label" size="small">
        <PublishIcon fontSize="small" style={{ color: light ? 'white' : '' }} />
        <Input
          type="file"
          value=""
          style={{ display: 'none' }}
          inputProps={{
            accept: '.csv',
          }}
          onChange={handleFileUpload}
        />
      </IconButton>
    </Tooltip>
  )
}

export default UploadCSVButton
