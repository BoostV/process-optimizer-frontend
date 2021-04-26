import CategoricalVariable from './categorical-variable';
import ValueVariable from './value-variable';
import { Card, CardContent, Grid, IconButton, Radio, Typography } from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close";
import { useState } from "react"
import { VariableType } from '../types/common';
import useStyles from '../styles/variable-editor.style';

type VariableEditorProps = {
  addValueVariable: (valueVariable: VariableType) => void
  addCategoricalVariable: (categoricalVariable: VariableType) => void
  close: () => void
}

export default function VariableEditor(props: VariableEditorProps) {
  const [radioIndex, setRadioIndex] = useState(0)
  const classes = useStyles()

  return (
    <Grid container spacing={0}>
      <Grid item xs={6}>
        <Card className={classes.main}>
          <CardContent>
            <Grid container spacing={0}>

              <Grid item xs={11}>
                <Typography variant="h6" gutterBottom>
                  Add variable
                </Typography>
              </Grid>

              <Grid item xs={1}>
                <IconButton size="small" onClick={() => props.close()}>
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
                <br/>
                <br/>
                {radioIndex === 0 &&
                  <ValueVariable onAdded={(valueVariable: VariableType) => props.addValueVariable(valueVariable)} />
                }
                {radioIndex === 1 &&
                  <CategoricalVariable onAdded={(categoricalVariable: VariableType) => props.addCategoricalVariable(categoricalVariable)} />
                }
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}