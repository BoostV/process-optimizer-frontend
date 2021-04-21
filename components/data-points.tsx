import { Button, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@material-ui/core";
import { ChangeEvent, useState } from "react";
import { ExperimentType, DataPointType } from "../types/common";

type DataPointProps = {
  experiment: ExperimentType,
  onAddDataPoints: (dataPoints: DataPointType[]) => void,
}

export default function DataPoints(props: DataPointProps) {
  const { experiment: { valueVariables, categoricalVariables, dataPoints } } = props
  const [newDataPoints, setNewDataPoints] = useState<DataPointType[]>(createInitialNewPoints())

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

  function onNewPointChange(changePoint: DataPointType, changeIndex: number, changeValue: string) {
    const newPoints = newDataPoints.map((point, index) => {
      if (index !== changeIndex) {
        return point
      } else {
        const newValue: any = point.name === "score" ? [parseFloat(changeValue)] as number[]: changeValue as string
        return {
          ...changePoint,
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
          
        <Table size="small">
          <TableHead>
            <TableRow>
              {valueVariables.map((valueVar, valueVarIndex) => 
                <TableCell key={valueVarIndex}>{valueVar.name}</TableCell>
              )}
              {categoricalVariables.map((catVar, catVarIndex) => 
                <TableCell key={catVarIndex}>{catVar.name}</TableCell>
              )}
              <TableCell><i>Score</i></TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {dataPoints.map((points, pointsIndex) => 
              <TableRow key={pointsIndex}>
                {points.map((point, pointIndex) => {
                  if (point.name === "score") {
                    return <TableCell key={pointIndex}>{point.value[0]}</TableCell>
                  } else {
                    return <TableCell key={pointIndex}>{point.value}</TableCell>
                  }
                })}
              </TableRow>
            )}
            <TableRow>
              {dataPoints[0].map((point, pointIndex) => 
                <TableCell key={pointIndex}>
                  <TextField 
                    onChange={(e: ChangeEvent) => onNewPointChange(point, pointIndex, (e.target as HTMLInputElement).value)} />
                </TableCell>
              )}
            </TableRow>

          </TableBody>
        </Table>
        <br/>
        <Button variant="outlined" size="small" onClick={() => onAdd()}>Add</Button>
      </CardContent>
    </Card>
  )
}