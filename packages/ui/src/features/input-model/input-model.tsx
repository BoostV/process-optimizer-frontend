import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Button,
} from '@mui/material'
import VariableEditor from './variable-editor'
import useStyles from './input-model.style'
import { TitleCard } from '@ui/features/core/title-card/title-card'
import { Lens, Add, PanoramaFishEye } from '@mui/icons-material'
import {
  CategoricalVariableType,
  ValidationViolations,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { useState } from 'react'
import { EditControls } from './edit-controls'

type InputModelProps = {
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  onDeleteValueVariable?: (index: number) => void
  onDeleteCategoricalVariable?: (index: number) => void
  addValueVariable?: (valueVariable: ValueVariableType) => void
  editValueVariable?: (
    index: number,
    oldName: string,
    newVariable: ValueVariableType
  ) => void
  addCategoricalVariable?: (
    categoricalVariable: CategoricalVariableType
  ) => void
  editCategoricalVariable?: (
    index: number,
    oldName: string,
    newVariable: CategoricalVariableType
  ) => void
  violations?: ValidationViolations
}

export function InputModel(props: InputModelProps) {
  const {
    valueVariables,
    categoricalVariables,
    onDeleteValueVariable,
    onDeleteCategoricalVariable,
    addValueVariable,
    editValueVariable,
    addCategoricalVariable,
    editCategoricalVariable,
    violations,
  } = props

  const { classes } = useStyles()

  const [editingValueVariable, setEditingValueVariable] = useState<
    | {
        index: number
        variable: ValueVariableType
      }
    | undefined
  >(undefined)

  const [editingCategoricalVariable, setEditingCategoricalVariable] = useState<
    | {
        index: number
        variable: CategoricalVariableType
      }
    | undefined
  >(undefined)

  const [isEditorOpen, setEditorOpen] = useState<boolean>(false)

  const resetEditor = () => {
    setEditingValueVariable(undefined)
    setEditingCategoricalVariable(undefined)
    setEditorOpen(false)
  }

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
                        <Tooltip disableInteractive title="Discrete">
                          <Lens className={classes.iconValueType} />
                        </Tooltip>
                      ) : (
                        <Tooltip disableInteractive title="Continuous">
                          <PanoramaFishEye className={classes.iconValueType} />
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
                      <EditControls
                        onEdit={() => {
                          setEditingCategoricalVariable(undefined)
                          setEditingValueVariable({
                            index: valueIndex,
                            variable: valueVar,
                          })
                          setEditorOpen(true)
                        }}
                        onDelete={() => {
                          onDeleteValueVariable?.(valueIndex)
                          resetEditor()
                        }}
                      />
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
                        <EditControls
                          onEdit={() => {
                            setEditingValueVariable(undefined)
                            setEditingCategoricalVariable({
                              index: catIndex,
                              variable: catVar,
                            })
                            setEditorOpen(true)
                          }}
                          onDelete={() => {
                            onDeleteCategoricalVariable?.(catIndex)
                            resetEditor()
                          }}
                        />
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
            ) => addCategoricalVariable?.(categoricalVariable)}
            editCategoricalVariable={(
              oldName: string,
              newVariable: CategoricalVariableType
            ) => {
              if (editingCategoricalVariable !== undefined) {
                editCategoricalVariable?.(
                  editingCategoricalVariable.index,
                  oldName,
                  newVariable
                )
                resetEditor()
              }
            }}
            addValueVariable={(valueVariable: ValueVariableType) =>
              addValueVariable?.(valueVariable)
            }
            editValueVariable={(
              oldName: string,
              newVariable: ValueVariableType
            ) => {
              if (editingValueVariable !== undefined) {
                editValueVariable?.(
                  editingValueVariable.index,
                  oldName,
                  newVariable
                )
                resetEditor()
              }
            }}
            onCancel={() => resetEditor()}
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
            startIcon={<Add fontSize="small" />}
          >
            Add variable
          </Button>
        </Box>
      )}
    </TitleCard>
  )
}
