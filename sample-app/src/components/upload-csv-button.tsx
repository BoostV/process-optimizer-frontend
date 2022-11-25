import { IconButton, Input, Tooltip } from '@mui/material'
import { useExperiment } from '@/context/experiment'
import { csvToDataPoints } from '@/utility/converters'
import PublishIcon from '@mui/icons-material/Publish'
import { ChangeEvent } from 'react'
import { DataEntry } from '@process-optimizer-frontend/core/src/common/types/common'

const readFile = (file: Blob, dataHandler: (s: string) => void) => {
  const result = ''
  if (file) {
    const reader = new FileReader()
    reader.onload = e => dataHandler(e.target?.result as string)
    reader.readAsText(file)
  }
  return result
}
interface UploadCSVButtonProps {
  light?: boolean
  onUpload: (dataPoints: DataEntry[]) => void
}

const UploadCSVButton = ({ onUpload, light }: UploadCSVButtonProps) => {
  const {
    state: {
      experiment: { valueVariables, categoricalVariables, scoreVariables },
    },
  } = useExperiment()
  const handleFileUpload = (files: string | any[] | FileList) => {
    if (files && files.length > 0) {
      readFile(files[0], data =>
        onUpload(
          csvToDataPoints(
            data,
            valueVariables,
            categoricalVariables,
            scoreVariables
          )
        )
      )
    }
  }

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
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFileUpload(e.target.files ?? [])
          }
        />
      </IconButton>
    </Tooltip>
  )
}

export default UploadCSVButton
