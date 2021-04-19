import { Card, CardContent, Grid, Radio, TextField, Typography } from '@material-ui/core'
import { ChangeEvent, useState } from 'react';
import { CategoricalVariableType, ExperimentType, ValueVariableType } from '../types/common';
import CategoricalVariable from './categorical-variable';
import ValueVariable from './value-variable';

type ModelEditorProps = {
  experiment: ExperimentType
  updateName: (name: string) => void
  updateDescription: (description: string) => void
  addValueVariable: (valueVariable: ValueVariableType) => void
  addCategoricalVariable: (categoricalVariable: CategoricalVariableType) => void
}

export default function ModelEditor(props: ModelEditorProps) {
  const [radioIndex, setRadioIndex] = useState(0)

  return (
    <Card>
      <CardContent>
        <form>
          <TextField 
            name="name" 
            label="Name" 
            value={props.experiment.info.name}
            required
            onChange={(e: ChangeEvent) => props.updateName((e.target as HTMLInputElement).value)}
          />
          <br/>
          <br/>
          <TextField
            name="info.description"
            label="Description"
            value={props.experiment.info.description}
            required
            onChange={(e: ChangeEvent) => props.updateDescription((e.target as HTMLInputElement).value)}
          />
          <br />
          <br />
        </form>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add new variable
            </Typography>
            <Grid container spacing={0}>
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
                  <ValueVariable onAdded={(valueVariable: ValueVariableType) => props.addValueVariable(valueVariable)} />
                }
                {radioIndex === 1 &&
                  <CategoricalVariable onAdded={(categoricalVariable: CategoricalVariableType) => props.addCategoricalVariable(categoricalVariable)} />
                }
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
