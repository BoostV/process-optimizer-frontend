import CategoricalVariable from './categorical-variable';
import ValueVariable from './value-variable';
import { Box, Tab, Tabs } from "@material-ui/core"
import { useState } from "react"
import useStyles from '../styles/variable-editor.style';
import { CategoricalVariableType, ValueVariableType } from '../types/common';

type VariableEditorProps = {
  isAddVariableDisabled: boolean
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function VariableEditor(props: VariableEditorProps) {
  const { isAddVariableDisabled, addValueVariable, addCategoricalVariable } = props

  const [tabIndex, setTabIndex] = useState(0)
  const classes = useStyles()

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue)
  }

  return (
    <>
      <Tabs 
        variant="fullWidth" 
        value={tabIndex} 
        onChange={handleTabChange} 
        aria-label="simple tabs example">
        <Tab label="Continuous" className={classes.customTab}/>
        <Tab label="Discrete" className={classes.customTab}/>
        <Tab label="Categorical"  className={classes.customTab}/>
      </Tabs>
      <Box ml={2} mr={2}>
        {tabIndex === 0 &&
          <ValueVariable
            type="continuous" 
            isDisabled={isAddVariableDisabled}
            onAdded={(valueVariable: ValueVariableType) => addValueVariable(valueVariable)} />
        }
        {tabIndex === 1 &&
          <ValueVariable
            type="discrete" 
            isDisabled={isAddVariableDisabled}
            onAdded={(valueVariable: ValueVariableType) => addValueVariable(valueVariable)} />
        }
        {tabIndex === 2 &&
        <CategoricalVariable 
          isDisabled={isAddVariableDisabled}
          onAdded={(categoricalVariable: CategoricalVariableType) => addCategoricalVariable(categoricalVariable)} />
      }
      </Box>
    </>
  )
}