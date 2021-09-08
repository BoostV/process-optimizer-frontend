import { Button } from '@material-ui/core'
import { useExperiment } from '../context/experiment-context';
import { dataPointsToCSV } from '../utility/converters';
import { saveCSVToLocalFile } from '../utility/save-to-local-file';

const DownloadCSVButton = () => {
    const { state: {experiment: {id, dataPoints}} } = useExperiment()
    return <Button
        variant="contained"
        onClick={() => saveCSVToLocalFile(dataPointsToCSV(dataPoints), id + ".csv")}
        color="primary"
    >Download csv</Button>
}

export default DownloadCSVButton
