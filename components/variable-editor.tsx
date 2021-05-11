import CategoricalVariable from './categorical-variable';
import ValueVariable from './value-variable';
import { Box, Card, CardContent, Grid, IconButton, Radio, Typography } from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close";
import { useState } from "react"
import useStyles from '../styles/variable-editor.style';
import { CategoricalVariableType, ValueVariableType } from '../types/common';

type VariableEditorProps = {
  isAddVariableDisabled: boolean
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
  close: () => void
}

export default function VariableEditor(props: VariableEditorProps) {
  const { isAddVariableDisabled, addValueVariable, addCategoricalVariable, close } = props

  const [radioIndex, setRadioIndex] = useState(0)
  const classes = useStyles()

  return (
    <Grid container spacing={0}>
      <Grid item xs={12}>
        <Card className={classes.main}>
          <CardContent>
            <Grid container spacing={0}>

              <Grid item xs={11}>
                <Typography variant="h6" gutterBottom>
                  Add variable
                </Typography>
              </Grid>

              <Grid item xs={1}>
                <IconButton size="small" onClick={() => close()}>
                  <CloseIcon/>
                </IconButton>
              </Grid>

              <Grid item xs={3}>
                <Radio
                  checked={radioIndex === 0}
                  onChange={() => {setRadioIndex(0)}}
                />
                <Typography>Value</Typography>
              </Grid>
              <Grid item xs={9}>
                <Radio
                  checked={radioIndex === 1}
                  onChange={() => {setRadioIndex(1)}}
                />
                <Typography>Categorical</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box mt={2}>
                  {radioIndex === 0 &&
                    <ValueVariable 
                      isDisabled={isAddVariableDisabled}
                      onAdded={(valueVariable: ValueVariableType) => addValueVariable(valueVariable)} />
                  }
                  {radioIndex === 1 &&
                    <CategoricalVariable 
                      isDisabled={isAddVariableDisabled}
                      onAdded={(categoricalVariable: CategoricalVariableType) => addCategoricalVariable(categoricalVariable)} />
                  }
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}