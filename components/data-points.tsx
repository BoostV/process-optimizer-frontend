import { Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { ChangeEvent, ReactNode, useState } from "react";
import { ExperimentType, DataPointType, VariableType } from "../types/common";

type DataPointProps = {
  experiment: ExperimentType,
  onAddDataPoints: (dataPoints: DataPointType[]) => void,
}

export default function DataPoints(props: DataPointProps) {
  const SCORE = "score"
  const { experiment: { valueVariables, categoricalVariables, dataPoints } } = props
  const [newDataPoints, setNewDataPoints] = useState<DataPointType[]>(createInitialNewPoints())
  const variableNames: string[] = valueVariables.map(item => item.name)
    .concat(categoricalVariables.map(item => item.name))
    .concat(SCORE)
  

  function createInitialNewPoints(): DataPointType[] {
    let initialPoints: DataPointType[] = [];
    for (let i = 0; i < valueVariables.length + categoricalVariables.length + 1; i++) {
      initialPoints.push({
        name: "",
        value: "",
      })
    }
    return initialPoints
  }

  function onAdd() {
    props.onAddDataPoints(newDataPoints)
  }

  function onNewPointChange(name: string, pointIndex: number, value: string) {
    const newPoints = newDataPoints.map((point, index) => {
      if (index !== pointIndex) {
        return point
      } else {
        const newValue: any = point.name === SCORE ? [parseFloat(value)] as number[]: value as string
        return {
          name,
          value: newValue
        }
      }
    })
    setNewDataPoints(newPoints)
  }

  return (
    <Card>
      <CardContent>
      
        <Typography variant="h6" gutterBottom>
          Data points
        </Typography>
            
        {variableNames.length > 1 &&
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {variableNames.map((name, index) => 
                    <TableCell key={index}>{name}</TableCell>
                  )}
                </TableRow>
              </TableHead>
              
              <TableBody>
                {dataPoints.map((points, pointsIndex) => 
                  <TableRow key={pointsIndex}>
                    {points.map((point, pointIndex) => {
                      if (point.name === SCORE) {
                        return <TableCell key={pointIndex}>{point.value[0]}</TableCell>
                      } else {
                        return <TableCell key={pointIndex}>{point.value}</TableCell>
                      }
                    })}
                  </TableRow>
                )}
                <TableRow>
                  {variableNames.map((name, index) => 
                    <TableCell key={index}>
                      <TextField onChange={(e: ChangeEvent) => onNewPointChange(name, index, (e.target as HTMLInputElement).value)} />
                    </TableCell>
                  )}
                  </TableRow>

              </TableBody>
            </Table>
            <br/>
            <Button variant="outlined" onClick={() => onAdd()}>Add</Button>
          </>
        }
      </CardContent>
    </Card>
  )
}