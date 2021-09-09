import { Button, Input } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context';
import { DataPointType } from '../types/common';
import { csvToDataPoints } from '../utility/converters';

const readFile = (file, dataHandler) => {
    var result = ""
    if (file) {
        const reader = new FileReader()
        reader.onload = e => dataHandler(e.target.result as string)
        reader.readAsText(file)
    }
    return result
}
interface UploadCSVButtonProps {
    onUpload: (dataPoints: DataPointType[][]) => void
}

const UploadCSVButton = ({ onUpload } : UploadCSVButtonProps) => {
    const { state: { experiment: { valueVariables, categoricalVariables } } } = useExperiment()
    const handleFileUpload = e => readFile(e.target.files[0], data => onUpload(csvToDataPoints(data, valueVariables, categoricalVariables)))
    
    return <Button
        variant="contained"
        color="primary"
        component="label"
    >Upload csv
        <Input
            type="file"
            value=""
            style={{ display: 'none' }}
            inputProps={{
                accept:
                    ".csv"
            }}
            onChange={handleFileUpload}
        /></Button>
}

export default UploadCSVButton
