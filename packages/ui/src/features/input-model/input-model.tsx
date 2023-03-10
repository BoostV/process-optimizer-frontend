import {
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Button,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import VariableEditor from './variable-editor'
import useStyles from './input-model.style'
import { TitleCard } from '@ui/features/core/title-card/title-card'
import LensIcon from '@mui/icons-material/Lens'
import AddIcon from '@mui/icons-material/Add'
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye'
import {
  CategoricalVariableType,
  ValidationViolations,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { useState } from 'react'

type InputModelProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  onDeleteValueVariable: (index: number) => void
  onDeleteCategoricalVariable: (index: number) => void
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
  violations?: ValidationViolations
}

export function InputModel(props: InputModelProps) {
  const {
    valueVariables,
    categoricalVariables,
    onDeleteValueVariable,
    onDeleteCategoricalVariable,
    addValueVariable,
    addCategoricalVariable,
    violations,
  } = props

  const { classes } = useStyles()

  const [editingValueVariable, setEditingValueVariable] = useState<
    ValueVariableType | undefined
  >(undefined)

  const [editingCategoricalVariable, setEditingCategoricalVariable] = useState<
    CategoricalVariableType | undefined
  >(undefined)

  const [isEditorOpen, setEditorOpen] = useState<boolean>(false)

  return (
    <TitleCard
      title="Input model"
      padding={0}
      infoBoxes={
        violations !== undefined &&
        violations?.duplicateVariableNames.length > 0
          ? [
              {
                text: `Please remove duplicate variable names: ${violations.duplicateVariableNames.join(
                  ', '
                )}.`,
                type: 'error',
              },
            ]
          : undefined
      }
    >
      {(valueVariables.length > 0 || categoricalVariables.length > 0) && (
        <Box p={2}>
          {valueVariables.length > 0 && (
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
                    <TableCell>
                      {valueVar.type === 'discrete' ? (
                        <Tooltip title="Discrete">
                          <LensIcon className={classes.iconValueType} />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Continuous">
                          <PanoramaFishEyeIcon
                            className={classes.iconValueType}
                          />
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {valueVar.name}
                    </TableCell>
                    <TableCell align="left">{valueVar.description}</TableCell>
                    <TableCell align="right">{valueVar.min}</TableCell>
                    <TableCell align="right">{valueVar.max}</TableCell>
                    <TableCell align="right">
                      <Box className={classes.editIconsContainer}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingCategoricalVariable(undefined)
                            setEditingValueVariable(valueVar)
                            setEditorOpen(true)
                          }}
                        >
                          <EditIcon color="primary" fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => {
                            onDeleteValueVariable(valueIndex)
                            setEditingCategoricalVariable(undefined)
                            setEditingValueVariable(undefined)
                            setEditorOpen(false)
                          }}
                        >
                          <DeleteIcon color="primary" fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {categoricalVariables.length > 0 && (
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
                      <TableCell component="th" scope="row">
                        {catVar.name}
                      </TableCell>
                      <TableCell align="left">{catVar.description}</TableCell>
                      <TableCell align="left">
                        {catVar.options.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <Typography variant="body2">{option}</Typography>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        <Box className={classes.editIconsContainer}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingValueVariable(undefined)
                              setEditingCategoricalVariable(catVar)
                              setEditorOpen(true)
                            }}
                          >
                            <EditIcon color="primary" fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              onDeleteCategoricalVariable(catIndex)
                              setEditingCategoricalVariable(undefined)
                              setEditingValueVariable(undefined)
                              setEditorOpen(false)
                            }}
                          >
                            <DeleteIcon color="primary" fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      )}

      {isEditorOpen && (
        <Box pb={2} className={classes.editBox}>
          <VariableEditor
            valueVariables={valueVariables}
            categoricalVariables={categoricalVariables}
            addCategoricalVariable={(
              categoricalVariable: CategoricalVariableType
            ) => addCategoricalVariable(categoricalVariable)}
            addValueVariable={(valueVariable: ValueVariableType) =>
              addValueVariable(valueVariable)
            }
            onCancel={() => {
              setEditingValueVariable(undefined)
              setEditingCategoricalVariable(undefined)
              setEditorOpen(false)
            }}
            editingValueVariable={editingValueVariable}
            editingCategoricalVariable={editingCategoricalVariable}
          />
        </Box>
      )}

      {!isEditorOpen && (
        <Box m={1}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => setEditorOpen(true)}
            startIcon={<AddIcon fontSize="small" />}
          >
            Add variable
          </Button>
        </Box>
      )}
    </TitleCard>
  )
}
