import { Typography } from '@material-ui/core'
import { ExperimentType, ValueVariableType } from '../types/common'

type OptimizerModelProps = {
  experiment: ExperimentType
  onDeleteValueVariable: (valueVariable: ValueVariableType) => void
}

export default function OptimizerModel(props: OptimizerModelProps) {

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Model for optimizer
        </Typography>
        
        {props.experiment.valueVariables.map((item, index) => (
          <div key={index}>
            {item.name} {item.description} {item.minVal} {item.maxVal} <span onClick={() => {props.onDeleteValueVariable(item)}}>Delete</span>
          </div>
        ))}

        {props.experiment.categoricalVariables.map((item, index) => (
          <div></div>  
        ))}
    </>
  )
}
