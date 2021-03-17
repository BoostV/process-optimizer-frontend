import { Typography } from '@material-ui/core'
import { Experiment } from '../pages/experiment/[experimentid]'
import { experimentReducer } from '../reducers/reducers'

type OptimizerModelProps = {
  experiment: Experiment
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
