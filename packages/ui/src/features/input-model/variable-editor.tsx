import CategoricalVariable from './categorical-variable'
import ValueVariable from './value-variable'
import { Box, Tab, Tabs } from '@mui/material'
import { useState, ChangeEvent } from 'react'
import useStyles from './variable-editor.style'
import {
  CategoricalVariableType,
  ValueVariableType,
} from '@boostv/process-optimizer-frontend-core'

type VariableEditorProps = {
  categoricalVariables: CategoricalVariableType[]
  valueVariables: ValueVariableType[]
  editingValueVariable?: {
    index: number
    variable: ValueVariableType
  }
  editingCategoricalVariable?: {
    index: number
    variable: CategoricalVariableType
  }
  addValueVariable: (valueVariable: ValueVariableType) => void
  editValueVariable: (newVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
  editCategoricalVariable: (newVariable: CategoricalVariableType) => void
  onCancel: () => void
}

export default function VariableEditor(props: VariableEditorProps) {
  return (
    <VariableEditorInner
      {...props}
      key={
        props.editingValueVariable
          ? `value-${props.editingValueVariable.index}`
          : props.editingCategoricalVariable
            ? `categorial-${props.editingCategoricalVariable.index}`
            : 'blank'
      }
    />
  )
}

function VariableEditorInner(props: VariableEditorProps) {
  const {
    categoricalVariables,
    valueVariables,
    editingValueVariable,
    editingCategoricalVariable,
    addValueVariable,
    editValueVariable,
    addCategoricalVariable,
    editCategoricalVariable,
    onCancel,
  } = props

  const isValueTabSelected =
    (editingValueVariable === undefined &&
      editingCategoricalVariable === undefined) ||
    editingCategoricalVariable === undefined

  const [tabIndex, setTabIndex] = useState<number>(isValueTabSelected ? 0 : 1)

  const { classes } = useStyles()

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
          label="Numeric"
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
            onAdd={(valueVariable: ValueVariableType) =>
              addValueVariable(valueVariable)
            }
            onEdit={(newVariable: ValueVariableType) =>
              editValueVariable(newVariable)
            }
            onCancel={onCancel}
          />
        )}
        {tabIndex === 1 && (
          <CategoricalVariable
            categoricalVariables={categoricalVariables}
            valueVariables={valueVariables}
            editingVariable={editingCategoricalVariable}
            onAdd={(categoricalVariable: CategoricalVariableType) =>
              addCategoricalVariable(categoricalVariable)
            }
            onEdit={(newVariable: CategoricalVariableType) =>
              editCategoricalVariable(newVariable)
            }
            onCancel={onCancel}
          />
        )}
      </Box>
    </>
  )
}
