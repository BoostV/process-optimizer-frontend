import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { CategoricalVariableType, ExperimentType, ValueVariableType } from '../types/common'

type OptimizerModelProps = {
  experiment: ExperimentType
  onDeleteValueVariable: (valueVariable: ValueVariableType) => void
  onDeleteCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function OptimizerModel(props: OptimizerModelProps) {

  const { experiment: { valueVariables, categoricalVariables} } = props

  return (
      <>
        <Typography variant="h6" gutterBottom>
          Model for optimizer
        </Typography>
       
        {valueVariables.length > 0 &&
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="left">Description</TableCell>
                <TableCell align="right">minVal</TableCell>
                <TableCell align="right">maxVal</TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {valueVariables.map((valueVar, valueIndex) => (
                <TableRow key={valueIndex}>
                  <TableCell component="th" scope="row">{valueVar.name}</TableCell>
                  <TableCell align="left">{valueVar.description}</TableCell>
                  <TableCell align="right">{valueVar.minVal}</TableCell>
                  <TableCell align="right">{valueVar.maxVal}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => {props.onDeleteValueVariable(valueVar)}}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }

        {categoricalVariables.length > 0 &&
          <>
            <br/>
            <br/>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell align="left">Description</TableCell>
                  <TableCell align="left">Options</TableCell>
                  <TableCell align="left"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categoricalVariables.map((catVar, catIndex) => (
                  <TableRow key={catIndex}>
                    <TableCell component="th" scope="row">{catVar.name}</TableCell>
                    <TableCell align="left">{catVar.description}</TableCell>
                    <TableCell align="left">
                      {catVar.options.map((option, optionIndex) => (
                        <div key={optionIndex}><Typography variant="body2">{option}</Typography><br/></div>
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => {props.onDeleteCategoricalVariable(catVar)}}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        }
    </>
  )
}
