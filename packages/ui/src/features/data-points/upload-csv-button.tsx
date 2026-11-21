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
  onError?: (error: unknown) => void
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  scoreVariables: ScoreVariableType[]
  separator?: string
}

const UploadCSVButton = ({
  onUpload,
  onError,
  light,
  valueVariables,
  categoricalVariables,
  scoreVariables,
  separator = ';',
}: UploadCSVButtonProps) => {
  const handleFileUpload = (files: File[]) => {
    if (files && files.length > 0 && files[0] !== undefined) {
      readFile(files[0], data => {
        // Parsing can throw on a malformed file or a delimiter mismatch. Catch
        // it and surface via onError so the consumer can inform the user;
        // don't call onUpload with a failed parse.
        let parsed: DataEntry[]
        try {
          parsed = csvToDataPoints(
            data,
            valueVariables,
            categoricalVariables,
            scoreVariables,
            separator
          )
        } catch (error) {
          onError?.(error)
          return
        }
        onUpload(parsed)
      })
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
            'data-testid': 'upload-csv-input',
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
