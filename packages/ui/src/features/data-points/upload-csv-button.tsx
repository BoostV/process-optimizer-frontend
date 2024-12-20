import { IconButton, Input, Tooltip } from '@mui/material'
import { Publish } from '@mui/icons-material'
import { ChangeEvent } from 'react'
import {
  CategoricalVariableType,
  DataEntry,
  ScoreVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { csvToDataPoints } from '@boostv/process-optimizer-frontend-core'

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
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
}

const UploadCSVButton = ({
  onUpload,
  light,
  valueVariables,
  categoricalVariables,
  scoreVariables,
}: UploadCSVButtonProps) => {
  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0 && files[0] !== undefined) {
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
    <Tooltip disableInteractive title="Upload CSV">
      <IconButton component="label" size="small">
        <Publish fontSize="small" style={{ color: light ? 'white' : '' }} />
        <Input
          type="file"
          value=""
          style={{ display: 'none' }}
          inputProps={{
            accept: '.csv',
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleFileUpload(Array.from(e.target.files || []))
          }
        />
      </IconButton>
    </Tooltip>
  )
}

export default UploadCSVButton
