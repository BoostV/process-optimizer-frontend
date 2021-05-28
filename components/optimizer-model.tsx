import { Box, Button, Card, CardContent, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { CategoricalVariableType, ValueVariableType } from '../types/common'
import DeleteIcon from '@material-ui/icons/Delete'
import { FC, useState } from 'react'
import VariableEditor from './variable-editor'

type OptimizerModelProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  disabled:boolean
  onDeleteValueVariable: (valueVariable: ValueVariableType) => void
  onDeleteCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function OptimizerModel(props: OptimizerModelProps) {
  const { valueVariables, categoricalVariables, disabled, onDeleteValueVariable, onDeleteCategoricalVariable, addValueVariable, addCategoricalVariable } = props
  const [isAddOpen, setAddOpen] = useState(false)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Input model
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
                      disabled={disabled}
                      size="small" 
                      onClick={() => {onDeleteValueVariable(valueVar)}}>
                      <DeleteIcon color={disabled ? "inherit" : "primary"} fontSize="small"/>
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }

        {categoricalVariables.length > 0 &&
          <Box mt={2} mb={2}>
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
                        disabled={disabled}
                        size="small" 
                        onClick={() => {onDeleteCategoricalVariable(catVar)}}>
                        <DeleteIcon color={disabled ? "inherit" : "primary"} fontSize="small"/>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        }
        {!isAddOpen &&
        <Box mt={2}>
          <Button  
            disabled={disabled} 
            variant="outlined" 
            size="small" 
            onClick={() => setAddOpen(true)}>Add variable</Button>
          </Box>
        }
        {isAddOpen &&
          <Box mt={2}>
            <VariableEditor 
              isAddVariableDisabled={disabled}
              addCategoricalVariable={(categoricalVariable: CategoricalVariableType) => addCategoricalVariable(categoricalVariable)}
              addValueVariable={(valueVariable: ValueVariableType) => addValueVariable(valueVariable)}
              close={() => setAddOpen(false)} />
          </Box>
        }

        {disabled && 
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              Note: Model cannot be updated while there are data points
            </Typography>
          </Box>
        }
      </CardContent>
    </Card>
  )
}
