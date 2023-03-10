import CategoricalVariable from './categorical-variable'
import ValueVariable from './value-variable'
import { Box, Tab, Tabs } from '@mui/material'
import { useState, ChangeEvent, useEffect, useMemo } from 'react'
import useStyles from './variable-editor.style'
import {
  CategoricalVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'

type VariableEditorProps = {
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  editingValueVariable: ValueVariableType | undefined
  editingCategoricalVariable: CategoricalVariableType | undefined
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
  onCancel: () => void
}

export default function VariableEditor(props: VariableEditorProps) {
  const {
    categoricalVariables,
    valueVariables,
    editingValueVariable,
    editingCategoricalVariable,
    addValueVariable,
    addCategoricalVariable,
    onCancel,
  } = props

  const isValueTabSelected = useMemo(
    () =>
      (editingValueVariable === undefined &&
        editingCategoricalVariable === undefined) ||
      editingCategoricalVariable === undefined,
    [editingValueVariable, editingCategoricalVariable]
  )

  const [tabIndex, setTabIndex] = useState<number>(isValueTabSelected ? 0 : 1)

  const { classes } = useStyles()

  useEffect(() => {
    setTabIndex(isValueTabSelected ? 0 : 1)
  }, [isValueTabSelected, setTabIndex])

  const handleTabChange = (_event: ChangeEvent<unknown>, newValue: number) => {
    setTabIndex(newValue)
  }

  return (
    <>
      <Tabs
        variant="fullWidth"
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="variables"
      >
        <Tab
          label="Value"
          className={classes.customTab}
          disabled={editingCategoricalVariable !== undefined}
        />
        <Tab
          label="Categorical"
          className={classes.customTab}
          disabled={editingValueVariable !== undefined}
        />
      </Tabs>
      <Box ml={2} mr={2} mt={2}>
        {tabIndex === 0 && (
          <ValueVariable
            categoricalVariables={categoricalVariables}
            valueVariables={valueVariables}
            editingVariable={editingValueVariable}
            onAdded={(valueVariable: ValueVariableType) =>
              addValueVariable(valueVariable)
            }
            onCancel={onCancel}
          />
        )}
        {tabIndex === 1 && (
          <CategoricalVariable
            categoricalVariables={categoricalVariables}
            valueVariables={valueVariables}
            editingVariable={editingCategoricalVariable}
            onAdded={(categoricalVariable: CategoricalVariableType) =>
              addCategoricalVariable(categoricalVariable)
            }
            onCancel={onCancel}
          />
        )}
      </Box>
    </>
  )
}
