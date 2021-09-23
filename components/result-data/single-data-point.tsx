import { Table, TableHead, TableRow, TableBody, TableCell, Typography, Box } from '@material-ui/core'
import useStyles from './single-data-point.style'

interface SingleDataPointProps {
  title: string
  headers: string[]
  dataPoint: any[][]
}

export const SingleDataPoint = ({ title, headers, dataPoint }: SingleDataPointProps) => {
  const classes = useStyles()

  return (
    <Box className={classes.tableContainer} pb={2}>
      <Typography variant="caption" className={classes.title}>{title}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headers.concat(["score"]).map((h, idx) => <TableCell className={classes.cell} key={idx}>{h}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {dataPoint.flat().map((dp, idx) => <TableCell className={classes.cell} key={idx}>{dp}</TableCell>)}
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}