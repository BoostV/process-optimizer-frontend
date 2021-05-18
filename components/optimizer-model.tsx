import { Box, Button, Card, CardContent, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { CategoricalVariableType, TableDataRow, ValueVariableType } from '../types/common'
import DeleteIcon from '@material-ui/icons/Delete'
import { useState } from 'react'
import VariableEditor from './variable-editor'
import { EditableTable } from './editable-table'

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

  const valueDataRows: TableDataRow[] = valueVariables.map((item, i) => {
    return {
      dataPoints: [
        {
          name: "Name",
          value: item.name
        },
        {
          name: "Description",
          value: item.description
        },
        {
          name: "minVal",
          value: item.minVal
        },
        ,
        {
          name: "maxVal",
          value: item.maxVal
        }
      ],
      isEditMode: false,
      isNew: false,
    }
  })

  //TODO: Create reducer or refactor data-points-reducer to handle both
  //TODO: Handle 'edit' and 'edit confirm'
  const [valueRows, setValueRows] = useState(valueDataRows)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Model for optimizer
        </Typography>
       
        {valueVariables.length > 0 &&
          <EditableTable
            rows={valueRows}
            disableDelete={disabled}
            nonEditableItems={['Name', 'Description']}
            onDelete={(rowIndex: number) => onDeleteValueVariable(valueVariables[rowIndex])}
            onEdit={() => console.log('edit')}
            onEditCancel={(rowIndex: number) => {
              setValueRows([...valueRows.map((item, i) => {
                if (i !== rowIndex) {
                  return item
                } else {
                  return { 
                    ...item, 
                    isEditMode: false  
                  }
                }
              }
            )])
            }}
            onEditConfirm={() => console.log('edit confirm')}
            onToggleEditMode={(rowIndex: number) => {
              setValueRows([...valueRows.map((item, i) => {
                  if (i !== rowIndex) {
                    return item
                  } else {
                    return { 
                      ...item, 
                      isEditMode: true  
                    }
                  }
                }
              )])
            }}/>
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
