import { Button, Card, CardContent, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { CategoricalVariableType, ExperimentType, ValueVariableType } from '../types/common'
import DeleteIcon from '@material-ui/icons/Delete'
import { ReactNode, useState } from 'react'
import VariableEditor from './variable-editor'

type OptimizerModelProps = {
  experiment: ExperimentType
  onDeleteValueVariable: (valueVariable: ValueVariableType) => void
  onDeleteCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function OptimizerModel(props: OptimizerModelProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints } } = props
  const [isAddOpen, setAddOpen] = useState(false)

  return (
    <Card>
      <CardContent>
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
                    <IconButton 
                      disabled={dataPoints.length > 0}
                      size="small" 
                      onClick={() => {props.onDeleteValueVariable(valueVar)}}>
                      <DeleteIcon color={dataPoints.length > 0 ? "inherit" : "primary"} fontSize="small"/>
                    </IconButton>
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
                        <div key={optionIndex}>
                          <Typography variant="body2">{option}</Typography>
                        </div>
                      ))}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        disabled={dataPoints.length > 0}
                        size="small" 
                        onClick={() => {props.onDeleteCategoricalVariable(catVar)}}>
                        <DeleteIcon color={dataPoints.length > 0 ? "inherit" : "primary"} fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        }
        <br/>
        <br/>
        {!isAddOpen &&
          <Button  
            disabled={dataPoints.length > 0} 
            variant="outlined" 
            size="small" 
            onClick={() => setAddOpen(true)}>Add variable</Button>
        }
        {isAddOpen &&
          <VariableEditor 
            isAddVariableDisabled={dataPoints.length > 0}
            addCategoricalVariable={(categoricalVariable: CategoricalVariableType) => props.addCategoricalVariable(categoricalVariable)}
            addValueVariable={(valueVariable: ValueVariableType) => props.addValueVariable(valueVariable)}
            close={() => setAddOpen(false)} />
        }

        {dataPoints.length > 0 && 
          <div>
            <br/>
            <Typography variant="body2" color="textSecondary">
              Note: Model cannot be updated while there are data points
            </Typography>
          </div>
        }
      </CardContent>
    </Card>
  )
}
