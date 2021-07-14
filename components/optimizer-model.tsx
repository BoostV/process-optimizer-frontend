import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography, Tooltip } from '@material-ui/core'
import { CategoricalVariableType, ValueVariableType } from '../types/common'
import DeleteIcon from '@material-ui/icons/Delete'
import VariableEditor from './variable-editor'
import useStyles from '../styles/optimizer-model.style'
import { TitleCard } from './title-card'
import LensIcon from '@material-ui/icons/Lens'
import PanoramaFishEyeIcon from '@material-ui/icons/PanoramaFishEye'

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
  const classes = useStyles()

  return (
    <TitleCard title="Input model" padding={0}>
      {(valueVariables.length > 0 || categoricalVariables.length > 0) &&
        <Box p={2}>
          {valueVariables.length > 0 &&
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
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
                    <TableCell>{valueVar.discrete ? 
                      <Tooltip title="Discrete">
                        <LensIcon className={classes.iconDiscrete}/>
                      </Tooltip> : 
                      <Tooltip title="Continuous">
                        <PanoramaFishEyeIcon className={classes.iconDiscrete} />
                      </Tooltip>}
                    </TableCell>
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
        </Box>
      }
        
      <Box pb={2} className={classes.editBox}>
        {!disabled &&
          <VariableEditor 
            isAddVariableDisabled={disabled}
            addCategoricalVariable={(categoricalVariable: CategoricalVariableType) => addCategoricalVariable(categoricalVariable)}
            addValueVariable={(valueVariable: ValueVariableType) => addValueVariable(valueVariable)}
          />
        }
      
        {disabled && 
          <Box pt={2} pr={2} pl={2}>
            <Typography variant="body2" color="textSecondary">
              Model cannot be updated while there are data points.
            </Typography>
          </Box>
        }
      </Box>
    </TitleCard>
  )
}
