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
import useStyles, { disabledCell } from './input-model.style'
import { TitleCard } from '@ui/features/core/title-card/title-card'
import { Lens, Add, PanoramaFishEye } from '@mui/icons-material'
import {
  CategoricalVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'
import { useState } from 'react'
import { EditControls } from './edit-controls'

type InputModelProps = {
  id?: string
  valueVariables: ValueVariableType[]
  categoricalVariables: CategoricalVariableType[]
  onDeleteValueVariable?: (index: number) => void
  addValueVariable?: (valueVariable: ValueVariableType) => void
  editValueVariable?: (index: number, newVariable: ValueVariableType) => void
  setValueVariableEnabled?: (index: number, enabled: boolean) => void
  onDeleteCategoricalVariable?: (index: number) => void
  addCategoricalVariable?: (
    categoricalVariable: CategoricalVariableType
  ) => void
  editCategoricalVariable?: (
    index: number,
    newVariable: CategoricalVariableType
  ) => void
  setCategoricalVariableEnabled?: (index: number, enabled: boolean) => void
}

export function InputModel(props: InputModelProps) {
  const {
    id,
    valueVariables,
    categoricalVariables,
    onDeleteValueVariable,
    onDeleteCategoricalVariable,
    addValueVariable,
    editValueVariable,
    addCategoricalVariable,
    editCategoricalVariable,
    setValueVariableEnabled,
    setCategoricalVariableEnabled,
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
    <TitleCard id={id} title="Input model" padding={0}>
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
                    <TableCell
                      component="th"
                      scope="row"
                      style={valueVar.enabled ? {} : disabledCell}
                    >
                      {valueVar.name}
                    </TableCell>
                    <TableCell
                      align="left"
                      style={valueVar.enabled ? {} : disabledCell}
                    >
                      {valueVar.description}
                    </TableCell>
                    <TableCell
                      align="right"
                      style={valueVar.enabled ? {} : disabledCell}
                    >
                      {valueVar.min}
                    </TableCell>
                    <TableCell
                      align="right"
                      style={valueVar.enabled ? {} : disabledCell}
                    >
                      {valueVar.max}
                    </TableCell>
                    <TableCell align="right">
                      <EditControls
                        onEnabledToggled={enabled =>
                          setValueVariableEnabled?.(valueIndex, enabled)
                        }
                        enabled={valueVar.enabled}
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
                      <TableCell
                        component="th"
                        scope="row"
                        style={catVar.enabled ? {} : disabledCell}
                      >
                        {catVar.name}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={catVar.enabled ? {} : disabledCell}
                      >
                        {catVar.description}
                      </TableCell>
                      <TableCell
                        align="left"
                        style={catVar.enabled ? {} : disabledCell}
                      >
                        {catVar.options.map((option, optionIndex) => (
                          <div key={optionIndex}>
                            <Typography variant="body2">{option}</Typography>
                          </div>
                        ))}
                      </TableCell>
                      <TableCell align="right">
                        <EditControls
                          enabled={catVar.enabled}
                          onEnabledToggled={enabled =>
                            setCategoricalVariableEnabled?.(catIndex, enabled)
                          }
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
            editCategoricalVariable={(newVariable: CategoricalVariableType) => {
              if (editingCategoricalVariable !== undefined) {
                editCategoricalVariable?.(
                  editingCategoricalVariable.index,
                  newVariable
                )
                resetEditor()
              }
            }}
            addValueVariable={(valueVariable: ValueVariableType) =>
              addValueVariable?.(valueVariable)
            }
            editValueVariable={(newVariable: ValueVariableType) => {
              if (editingValueVariable !== undefined) {
                editValueVariable?.(editingValueVariable.index, newVariable)
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
