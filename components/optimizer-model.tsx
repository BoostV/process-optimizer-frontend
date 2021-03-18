import { Typography } from '@material-ui/core'
import { rootReducer } from '../reducers/reducers'
import { ExperimentType } from '../types/common'

type OptimizerModelProps = {
  experiment: ExperimentType
}

export default function OptimizerModel(props: OptimizerModelProps) {

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Model for optimizer
        </Typography>
        
        {props.experiment.categoricalVariables.map((item, index) => (
          <div key={index}>{item.name} {item.description} {item.minVal} {item.maxVal}</div>
        ))}

        {props.experiment.valueVariables.map((item, index) => (
          <div></div>  
        ))}
    </>
  )
}
