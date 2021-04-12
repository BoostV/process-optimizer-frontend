import { Typography } from '@material-ui/core'
import { CategoricalVariableType, ExperimentType, ValueVariableType } from '../types/common'

type OptimizerModelProps = {
  experiment: ExperimentType
  onDeleteValueVariable: (valueVariable: ValueVariableType) => void
  onDeleteCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function OptimizerModel(props: OptimizerModelProps) {

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Model for optimizer
        </Typography>
        
        {props.experiment.valueVariables.map((item, index) => (
          <div key={index}>
          <Typography variant="body1">{item.name} {item.description} {item.minVal} {item.maxVal} <span onClick={() => {props.onDeleteValueVariable(item)}}>Delete</span></Typography>
          </div>
        ))}

        {props.experiment.categoricalVariables.map((catVar, catIndex) => (
          <div key={catIndex}>
             <Typography variant="body1">{catVar.name} {catVar.description} <span onClick={() => {props.onDeleteCategoricalVariable(catVar)}}>Delete</span></Typography>
            {catVar.options.map((option, optionIndex) => (
            <div key={optionIndex}><Typography variant="body2">{option}</Typography></div>
            ))}
          </div>  
        ))}
    </>
  )
}
