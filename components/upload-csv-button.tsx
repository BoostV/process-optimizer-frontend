import { Button, Input } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context';
import { csvToDataPoints, dataPointsToCSV } from '../utility/converters';

const readFile = (file, dataHandler) => {
    var result = ""
    if (file) {
        const reader = new FileReader()
        reader.onload = e => dataHandler(e.target.result as string)
        reader.readAsText(file)
    }
    return result
}

const UploadCSVButton = () => {
    const { dispatch, state: { experiment: { valueVariables, categoricalVariables, dataPoints } } } = useExperiment()
    const handleFileUpload = e => readFile(e.target.files[0], data => dispatch({ type: "updateDataPoints", payload: csvToDataPoints(data, valueVariables, categoricalVariables) }))

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
